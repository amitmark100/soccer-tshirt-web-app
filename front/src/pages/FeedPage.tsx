import { useEffect, useRef, useState } from 'react';

import Post from '../components/Feed/Post';
import PostPreviewModal from '../components/Common/PostPreviewModal';
import LeftSidebar from '../components/Sidebar/LeftSidebar';
import RightSidebar from '../components/Sidebar/RightSidebar';
import { useFeed } from '../hooks/useFeed';
import { Post as PostType } from '../types/types';
import '../styles/FeedPage.css';

const FeedPage = () => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) {
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
  }, [hasMore, loadMore]);

  const filteredPosts = visiblePosts.filter((post) => {
    const searchableContent = `${post.title} ${post.description} ${post.username}`.toLowerCase();
    return searchableContent.includes(searchValue.toLowerCase());
  });

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
              placeholder="Search designs..."
              aria-label="Search designs"
            />
          </div>
        </header>

        <section className="feed-posts" aria-label="Design feed">
          {isLoading ? <p className="feed-end">Loading designs...</p> : null}
          {errorMessage ? <p className="feed-end">{errorMessage}</p> : null}

          {filteredPosts.map((post) => (
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

          {!isLoading && !errorMessage && hasMore ? (
            <div ref={loadMoreRef} className="feed-load-more" aria-hidden="true">
              Loading more designs...
            </div>
          ) : !isLoading && !errorMessage ? (
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
