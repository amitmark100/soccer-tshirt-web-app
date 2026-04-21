import { useEffect, useRef, useState } from 'react';

import Post from '../components/Feed/Post';
import PostPreviewModal from '../components/Common/PostPreviewModal';
import Loader from '../components/Loader/Loader';
import LeftSidebar from '../components/Sidebar/LeftSidebar';
import RightSidebar from '../components/Sidebar/RightSidebar';
import { useFeed } from '../hooks/useFeed';
import { Post as PostType } from '../types/types';
import '../styles/FeedPage.css';

const FeedPage = () => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [isSmartSearchEnabled, setIsSmartSearchEnabled] = useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const {
    posts,
    visiblePosts,
    visibleLimit,
    hasMore,
    isLoading,
    errorMessage,
    smartSearchResults,
    smartSearchReasoning,
    isSmartSearchLoading,
    smartSearchErrorMessage,
    toggleLike,
    addComment,
    editPost,
    deletePost,
    runSmartSearch,
    clearSmartSearch,
    currentUserId,
    loadMore,
    resetVisibleCount
  } = useFeed();

  useEffect(() => {
    const isStandardSearchActive = searchValue.trim().length > 0;

    if (isSmartSearchEnabled || isStandardSearchActive || !loadMoreRef.current || !hasMore) {
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
  }, [hasMore, isSmartSearchEnabled, loadMore, searchValue]);

  useEffect(() => {
    if (!isSmartSearchEnabled) {
      clearSmartSearch();
    }
  }, [clearSmartSearch, isSmartSearchEnabled]);

  useEffect(() => {
    resetVisibleCount();
  }, [searchValue, isSmartSearchEnabled, resetVisibleCount]);

  const isStandardSearchActive = searchValue.trim().length > 0;

  const filteredPosts = posts.filter((post) => {
    const searchableContent = `${post.title} ${post.description} ${post.username}`.toLowerCase();
    return searchableContent.includes(searchValue.toLowerCase());
  });

  const standardDisplayedPosts = filteredPosts.slice(0, visibleLimit);
  const hasMoreStandardSearchResults = filteredPosts.length > standardDisplayedPosts.length;

  const displayedPosts = isSmartSearchEnabled
    ? smartSearchResults || []
    : isStandardSearchActive
      ? standardDisplayedPosts
      : visiblePosts;
  const shouldShowSmartSearchEmptyState =
    isSmartSearchEnabled &&
    !isSmartSearchLoading &&
    !smartSearchErrorMessage &&
    smartSearchResults !== null &&
    displayedPosts.length === 0;
  const shouldShowStandardSearchEmptyState =
    !isSmartSearchEnabled && isStandardSearchActive && displayedPosts.length === 0;
  const shouldShowLoadMore =
    !isLoading &&
    !errorMessage &&
    !isSmartSearchEnabled &&
    (isStandardSearchActive ? hasMoreStandardSearchResults : hasMore);

  const handleSmartSearch = () => {
    runSmartSearch(searchValue);
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
                  disabled={isSmartSearchLoading || !searchValue.trim()}
                >
                  {isSmartSearchLoading ? 'Searching...' : 'Search'}
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
          {isLoading ? <div className="feed-end"><Loader label="Loading designs..." /></div> : null}
          {errorMessage ? <p className="feed-end">{errorMessage}</p> : null}
          {isSmartSearchEnabled && smartSearchErrorMessage ? (
            <p className="feed-end">{smartSearchErrorMessage || 'Smart search failed'}</p>
          ) : null}
          {isSmartSearchEnabled && isSmartSearchLoading ? (
            <div className="feed-end">
              <Loader label="Searching designs..." />
            </div>
          ) : null}

          {(!isSmartSearchEnabled || !isSmartSearchLoading) && displayedPosts.map((post) => (
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

          {shouldShowLoadMore ? (
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
        price={selectedPost?.price}
        size={selectedPost?.size}
        likes={selectedPost?.likes ?? 0}
        secondaryMetricLabel="comments"
        secondaryMetricValue={selectedPost?.totalComments ?? 0}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
};

export default FeedPage;
