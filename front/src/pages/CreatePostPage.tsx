import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import LeftSidebar from '../components/Sidebar/LeftSidebar';
import { useAppData } from '../context/AppDataContext';
import '../styles/CreatePostPage.css';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?auto=format&fit=crop&w=1200&q=80';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const { createPost } = useAppData();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [designImage, setDesignImage] = useState<string>(DEFAULT_IMAGE);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    createPost({ title, description, designImage });
    navigate('/feed');
  };

  return (
    <div className="create-page-layout">
      <LeftSidebar />
      <main className="create-page-main">
        <section className="create-post-panel">
          <h1>Create Post</h1>
          <p>Share your latest jersey design with the community.</p>
          <form className="create-post-form" onSubmit={handleSubmit}>
            <label className="create-form-field">
              <span>Title</span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Name your design"
                required
              />
            </label>

            <label className="create-form-field">
              <span>Description</span>
              <textarea
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe colors, inspiration, and style"
                required
              />
            </label>

            <label className="create-form-field">
              <span>Image URL</span>
              <input
                type="url"
                value={designImage}
                onChange={(event) => setDesignImage(event.target.value)}
                placeholder="https://example.com/your-image.jpg"
                required
              />
            </label>

            <div className="create-form-preview">
              <span>Preview</span>
              <img src={designImage} alt="Design preview" />
            </div>

            <div className="create-post-actions">
              <button type="button" className="create-cancel-btn" onClick={() => navigate('/feed')}>
                Cancel
              </button>
              <button type="submit" className="create-submit-btn">
                Publish Post
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default CreatePostPage;
