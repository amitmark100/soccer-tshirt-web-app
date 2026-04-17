import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import Post from '../components/Feed/Post';
import PostPreviewModal from '../components/Common/PostPreviewModal';
import LeftSidebar from '../components/Sidebar/LeftSidebar';
import RightSidebar from '../components/Sidebar/RightSidebar';
import { useAPI } from '../hooks/useAPI';
import { useFeed } from '../hooks/useFeed';
import { Post as PostType } from '../types/types';
import '../styles/FeedPage.css';

const FeedPage = () => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [isSmartSearchEnabled, setIsSmartSearchEnabled] = useState<boolean>(false);
  const [smartSearchReasoning, setSmartSearchReasoning] = useState<string>('');
  const [smartSearchResults, setSmartSearchResults] = useState<PostType[] | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const API = useAPI();
  const {
    posts,
    visiblePosts,
    hasMore,
    isLoading,
    errorMessage,
    toggleLike,
    addComment,
    editPost,
    deletePost,
    currentUserId,
    loadMore
  } = useFeed();

  const smartSearchMutation = useMutation({
    mutationFn: (userPrompt: string) => API.post.smartSearch(userPrompt),
    onSuccess: ({ reasoning, posts: matchedPosts }) => {
      setSmartSearchReasoning(reasoning);
      setSmartSearchResults(matchedPosts);
    },
  });

  useEffect(() => {
    if (isSmartSearchEnabled || !loadMoreRef.current || !hasMore) {
      return;
    }

    // Prepared for future pagination APIs: this observer triggers the next page load.
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px 0px' }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasMore, isSmartSearchEnabled, loadMore]);

  useEffect(() => {
    if (!isSmartSearchEnabled) {
      setSmartSearchReasoning('');
      setSmartSearchResults(null);
      smartSearchMutation.reset();
    }
  }, [isSmartSearchEnabled, smartSearchMutation]);

  const filteredPosts = visiblePosts.filter((post) => {
    const searchableContent = `${post.title} ${post.description} ${post.username}`.toLowerCase();
    return searchableContent.includes(searchValue.toLowerCase());
  });

  const displayedPosts = isSmartSearchEnabled ? smartSearchResults || [] : filteredPosts;
  const shouldShowSmartSearchEmptyState =
    isSmartSearchEnabled &&
    !smartSearchMutation.isPending &&
    !smartSearchMutation.isError &&
    smartSearchResults !== null &&
    displayedPosts.length === 0;
  const shouldShowStandardSearchEmptyState =
    !isSmartSearchEnabled && !hasMore && displayedPosts.length === 0;

  const handleSmartSearch = () => {
    const trimmedSearchValue = searchValue.trim();

    if (!trimmedSearchValue) {
      setSmartSearchReasoning('');
      setSmartSearchResults([]);
      return;
    }

    smartSearchMutation.mutate(trimmedSearchValue);
  };

  return (
    <div className="feed-page">
      <LeftSidebar />

      <main className="feed-main">
        <header className="feed-header">
          <div className="feed-search-wrap">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M10 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm11.7 18.3l-3.6-3.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={isSmartSearchEnabled ? 'Describe the jerseys you want to find...' : 'Search designs...'}
              aria-label={isSmartSearchEnabled ? 'Smart search prompt' : 'Search designs'}
            />
            <div className="feed-search-actions">
              <div className="feed-smart-search-switch">
                <span
                  className={`feed-smart-search-icon ${isSmartSearchEnabled ? 'is-active' : ''}`}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path
                      d="M12 3l1.4 3.6L17 8l-3.6 1.4L12 13l-1.4-3.6L7 8l3.6-1.4L12 3zm6 9l.8 2.2L21 15l-2.2.8L18 18l-.8-2.2L15 15l2.2-.8L18 12zM6 14l1.1 2.9L10 18l-2.9 1.1L6 22l-1.1-2.9L2 18l2.9-1.1L6 14z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <label
                  className="feed-smart-search-toggle"
                  aria-label="Toggle smart search"
                  title="Toggle smart search"
                >
                  <input
                    type="checkbox"
                    checked={isSmartSearchEnabled}
                    onChange={(event) => setIsSmartSearchEnabled(event.target.checked)}
                  />
                  <span className="feed-smart-search-slider" />
                </label>
              </div>

              {isSmartSearchEnabled ? (
                <button
                  type="button"
                  className="feed-smart-search-button"
                  onClick={handleSmartSearch}
                  disabled={smartSearchMutation.isPending || !searchValue.trim()}
                >
                  {smartSearchMutation.isPending ? 'Searching...' : 'Search'}
                </button>
              ) : null}
            </div>
          </div>
        </header>

        {isSmartSearchEnabled && smartSearchReasoning ? (
          <section className="feed-smart-search-reasoning" aria-label="Smart search reasoning">
            <div className="feed-smart-search-reasoning-header">
              <h2>Model reasoning</h2>
              <span className="feed-smart-search-count">
                Found {displayedPosts.length} post{displayedPosts.length === 1 ? '' : 's'}
              </span>
            </div>
            <p>{smartSearchReasoning}</p>
          </section>
        ) : null}

        <section className="feed-posts" aria-label="Design feed">
          {isLoading ? <p className="feed-end">Loading designs...</p> : null}
          {errorMessage ? <p className="feed-end">{errorMessage}</p> : null}
          {isSmartSearchEnabled && smartSearchMutation.isError ? (
            <p className="feed-end">{smartSearchMutation.error instanceof Error ? smartSearchMutation.error.message : 'Smart search failed'}</p>
          ) : null}

          {displayedPosts.map((post) => (
            <Post
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onOpenPreview={setSelectedPost}
              onToggleLike={toggleLike}
              onAddComment={addComment}
              onEditPost={editPost}
              onDeletePost={deletePost}
            />
          ))}

          {!isLoading && !errorMessage && !isSmartSearchEnabled && hasMore ? (
            <div ref={loadMoreRef} className="feed-load-more" aria-hidden="true">
              Loading more designs...
            </div>
          ) : !isLoading && !errorMessage && shouldShowSmartSearchEmptyState ? (
            <p className="feed-end">No smart search results found.</p>
          ) : !isLoading && !errorMessage && shouldShowStandardSearchEmptyState ? (
            <p className="feed-end">No matching designs found.</p>
          ) : !isLoading && !errorMessage && !isSmartSearchEnabled ? (
            <p className="feed-end">You are all caught up.</p>
          ) : null}
        </section>
      </main>

      <RightSidebar posts={posts} />
      <PostPreviewModal
        isOpen={Boolean(selectedPost)}
        title={selectedPost?.title ?? ''}
        description={selectedPost?.description ?? ''}
        image={selectedPost?.designImage ?? ''}
        creatorLabel={selectedPost ? `@${selectedPost.username}` : ''}
        timestamp={selectedPost?.timestamp ?? ''}
        likes={selectedPost?.likes ?? 0}
        secondaryMetricLabel="comments"
        secondaryMetricValue={selectedPost?.totalComments ?? 0}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
};

export default FeedPage;
