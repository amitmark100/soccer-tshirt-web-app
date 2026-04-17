import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import Loader from '../components/Loader/Loader';
import LeftSidebar from '../components/Sidebar/LeftSidebar';
import { useAPI } from '../hooks/useAPI';
import { feedQueryKey } from '../hooks/useFeed';
import { Post } from '../types/types';
import '../styles/CreatePostPage.css';

const MIN_CREATE_LOADER_MS = 3000;

const waitForMinimumTime = async (startedAt: number, minimumMs: number) => {
  const elapsed = Date.now() - startedAt;

  if (elapsed < minimumMs) {
    await new Promise(resolve => setTimeout(resolve, minimumMs - elapsed));
  }
};

const CreatePostPage = () => {
  const API = useAPI();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [team, setTeam] = useState('');
  const [league, setLeague] = useState('');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('M');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl('');
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(nextPreviewUrl);

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [imageFile]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setImageFile(selectedFile);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!team.trim() || !league.trim() || !price.trim() || !description.trim() || !imageFile) {
      setError('Please complete all fields and attach an image.');
      return;
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      setError('Price must be a positive number.');
      return;
    }

    const startedAt = Date.now();

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('text', description.trim());
      formData.append(
        'jerseyDetails',
        JSON.stringify({
          team: team.trim(),
          league: league.trim(),
          price: numericPrice,
          size,
        })
      );
      formData.append('image', imageFile);

      const data = await API.post.create(formData);

      await waitForMinimumTime(startedAt, MIN_CREATE_LOADER_MS);

      queryClient.setQueryData<Post[]>(feedQueryKey, (currentPosts = []) => {
        return [API.post.mapToFeedPost(data), ...currentPosts];
      });

      navigate('/feed', { replace: true });
    } catch (error) {
      await waitForMinimumTime(startedAt, MIN_CREATE_LOADER_MS);
      setError(error instanceof Error ? error.message : 'Unable to create post right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
              <span>Team</span>
              <input
                type="text"
                value={team}
                onChange={(event) => setTeam(event.target.value)}
                placeholder="Manchester United"
                required
              />
            </label>

            <label className="create-form-field">
              <span>League</span>
              <input
                type="text"
                value={league}
                onChange={(event) => setLeague(event.target.value)}
                placeholder="Premier League"
                required
              />
            </label>

            <div className="create-form-grid">
              <label className="create-form-field">
                <span>Price</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="249.90"
                  required
                />
              </label>

              <label className="create-form-field">
                <span>Size</span>
                <select value={size} onChange={(event) => setSize(event.target.value)}>
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sizeOption => (
                    <option key={sizeOption} value={sizeOption}>
                      {sizeOption}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="create-form-field">
              <span>Description</span>
              <textarea
                rows={5}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the jersey condition, season, and standout details"
                required
              />
            </label>

            <label className="create-form-field">
              <span>Upload Image</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleImageChange}
                required
              />
            </label>

            <div className="create-form-preview">
              <span>Preview</span>
              {previewUrl ? (
                <img src={previewUrl} alt="Selected jersey preview" />
              ) : (
                <div className="create-form-preview-empty">
                  Select an image to preview your post.
                </div>
              )}
            </div>

            {error && <p className="create-form-error">{error}</p>}

            <div className="create-post-actions">
              <button type="button" className="create-cancel-btn" onClick={() => navigate('/feed')}>
                Cancel
              </button>
              <button type="submit" className="create-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? <Loader label="Publishing post..." /> : 'Publish Post'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default CreatePostPage;
