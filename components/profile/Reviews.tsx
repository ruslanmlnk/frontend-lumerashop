'use client';
import { useEffect, useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import type { AuthUser } from '@/lib/payload-auth';
import { getPayloadApiUrl } from '@/lib/payload-client';

interface Review {
  id: string;
  product: {
    id: string;
    title: string;
  };
  rating: number;
  comment: string;
  show: boolean;
  submittedAt: string;
}

interface ReviewsProps {
  user: AuthUser;
}

const Reviews = ({ user }: ReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/product-reviews?where[user][equals]=${user.id}&depth=1`);
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        const data = await response.json();
        setReviews(data.docs || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [user.id]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-[24px] font-semibold text-[#111111]">Moje komentáře</h2>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#111111]"></div>
          <p className="mt-2 text-gray-600">Načítání komentářů...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-[24px] font-semibold text-[#111111]">Moje komentáře</h2>
        <div className="text-center py-8">
          <p className="text-red-600">Chyba při načítání komentářů: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-[24px] font-semibold text-[#111111]">Moje komentáře</h2>

      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">Zatím jste nepřidali žádný komentář.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border border-gray-200 rounded-lg p-6 bg-white"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-[18px] font-medium text-[#111111] mb-2">
                    {review.product.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-sm text-gray-600">
                      {new Date(review.submittedAt).toLocaleDateString('cs-CZ')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      review.show
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {review.show ? 'Zveřejněno' : 'Čeká na schválení'}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;