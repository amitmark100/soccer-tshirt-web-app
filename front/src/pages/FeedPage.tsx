import { useEffect, useRef, useState } from 'react';

import Post from '../components/Feed/Post';
import PostPreviewModal from '../components/Common/PostPreviewModal';
import LeftSidebar from '../components/Sidebar/LeftSidebar';
import { useFeed } from '../hooks/useFeed';
import { Post as PostType } from '../types/types';
import '../styles/FeedPage.css';

const FeedPage = () => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [useAiSearch, setUseAiSearch] = useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const {
    posts,
    visiblePosts,
    hasMore,
    isLoading,
    error,
    toggleLike,
    addComment,
    editPost,
    deletePost,
    currentUserId,
    loadMore,
    setAiSearch,
    currentSearchQuery,
  } = useFeed();

  // Trigger AI search or reset to normal search (with debounce)
  useEffect(() => {
    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      try {
        // Null checks
        if (!searchValue && !useAiSearch) {
          setAiSearch(null);
          return;
        }

        if (useAiSearch && searchValue.trim()) {
          console.log('[AI Search] Debounce triggered, searching for:', searchValue.trim());
          // Use AI search with the search value
          setAiSearch(searchValue.trim());
        } else if (!useAiSearch) {
          // Reset to normal search (no AI)
          setAiSearch(null);
        }
      } catch (err) {
        console.error('[AI Search] Error in debounced search:', err);
      }
    }, 400); // 400ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [useAiSearch, searchValue, setAiSearch]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoading) {
      return;
    }

    // Intersection Observer for infinite scroll pagination
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
  }, [hasMore, isLoading, loadMore]);

  // Filter posts by search value if not using AI search
  const filteredPosts = (() => {
    try {
      // Null checks
      if (!posts || !visiblePosts) {
        console.log('[Feed] Posts or visiblePosts is null');
        return [];
      }

      if (useAiSearch) {
        // AI search already filters on backend
        return visiblePosts;
      }

      // Local text search
      return visiblePosts.filter((post) => {
        if (!post) return false;
        const searchableContent = `${post.title || ''} ${post.description || ''} ${post.username || ''}`.toLowerCase();
        return searchableContent.includes(searchValue.toLowerCase());
      });
    } catch (err) {
      console.error('[Feed] Error filtering posts:', err);
      return visiblePosts || [];
    }
  })();

  return (
    <div className="feed-page">
      <LeftSidebar />

      <main className="feed-main">
        <header className="feed-header">
          <div className="feed-search-wrap">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M10 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm11.7 18.3l-3.6-3.6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={useAiSearch ? 'Search with AI...' : 'Search designs...'}
              aria-label="Search designs"
            />
            <button
              onClick={() => setUseAiSearch(!useAiSearch)}
              className={`search-ai-toggle ${useAiSearch ? 'active' : ''}`}
              title={useAiSearch ? 'Switch to text search' : 'Switch to AI search'}
              aria-pressed={useAiSearch}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 3l1.5 5h5.25l-4.25 3.5 1.5 5-4.5-3.5-4.5 3.5 1.5-5-4.25-3.5h5.25L12 3z"/>
              </svg>
            </button>
          </div>
          {currentSearchQuery && useAiSearch && (
            <div className="feed-ai-search-hint">
              AI Search: "{currentSearchQuery}"
            </div>
          )}
        </header>

        {error && (
          <div className="feed-error" role="alert">
            <p>Error loading posts: {error}</p>
          </div>
        )}

        {isLoading && posts.length === 0 ? (
          <div className="feed-loading" aria-live="polite">
            <p>Loading posts...</p>
          </div>
        ) : (
          <>
            <section className="feed-posts" aria-label="Design feed">
              {filteredPosts.length === 0 ? (
                <div className="feed-empty">
                  <p>
                    {useAiSearch && currentSearchQuery
                      ? `No results found for "${currentSearchQuery}"`
                      : 'No posts to display'}
                  </p>
                </div>
              ) : (
                filteredPosts.map((post) => (
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
                ))
              )}

              {hasMore ? (
                <div
                  ref={loadMoreRef}
                  className="feed-load-more"
                  aria-hidden="true"
                  role="status"
                  aria-live="polite"
                >
                  {isLoading ? 'Loading more designs...' : 'Scroll to load more...'}
                </div>
              ) : filteredPosts.length > 0 ? (
                <p className="feed-end">You are all caught up.</p>
              ) : null}
            </section>
          </>
        )}
      </main>

      <PostPreviewModal
        isOpen={Boolean(selectedPost)}
        title={selectedPost?.title ?? ''}
        description={selectedPost?.description ?? ''}
        image={selectedPost?.designImage ?? ''}
        creatorLabel={selectedPost ? `@${selectedPost.username}` : ''}
        timestamp={selectedPost?.timestamp ?? ''}
        likes={selectedPost?.likes?.length ?? 0}
        secondaryMetricLabel="comments"
        secondaryMetricValue={selectedPost?.totalComments ?? 0}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
};

export default FeedPage;
