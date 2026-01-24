import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';

import normalizeContent from '../utils/normalizeContent';


import ContentHero from '../components/content/ContentHero';
import RelationRow from '../components/content/RelationRow';
import HorizontalScroller from '../components/content/HorizontalScroller';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';

export default function ContentDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    api.getContent(id).then(r => {
  setItem(normalizeContent(r.content));
});


    api.getSimilar(id).then(r => {
      setSimilar((r.results || []).map(normalizeContent));
    });
  }, [id]);

  if (!item) return null;

  return (
    <div className="space-y-12">
      <ContentHero item={item} />

      <RelationRow relations={item.relations} />

      <HorizontalScroller
        title="You may also like"
        items={similar}
      />

      <section className="max-w-3xl space-y-4">
        <h2 className="text-xl font-semibold">Reviews</h2>
        <ReviewForm contentId={id} />
        <ReviewList contentId={id} />
      </section>
    </div>
  );
}
