export const categories = [
  'Art & Culture',
  'Economics',
  'Education',
  'Spiritual',
  'Psychology',
];

// Sample books with live backend database IDs and offline fallback data
// Fully reflects the curated library: Image Album, PDF Documents, Word DOCX, and Chapter eBooks.
export const books = [
  {
    id: 28,
    slug: 'visual-ethiopia-architecture',
    title: 'Visual Ethiopia & Architecture (Image Album)',
    author: 'Cultural Heritage Archive',
    category: 'Art & Culture',
    description: 'A curated visual collection of Ethiopian architectural marvels, manuscripts, landscape photography, and heritage art in high resolution image format.',
    pages: 6,
    file_type: 'image/jpeg',
    file_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1200',
    cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
    chapters: [
      {
        id: 54,
        chapter_number: 1,
        title: 'Plate 1: Historic Architecture & Highlands',
        content: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1400',
      },
      {
        id: 55,
        chapter_number: 2,
        title: 'Plate 2: Ancient Manuscript & Script',
        content: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=1400',
      },
      {
        id: 56,
        chapter_number: 3,
        title: 'Plate 3: Monolithic Rock Churches',
        content: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1400',
      },
      {
        id: 57,
        chapter_number: 4,
        title: 'Plate 4: The Great Rift Valley Landscapes',
        content: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1400',
      },
      {
        id: 58,
        chapter_number: 5,
        title: 'Plate 5: Royal Castles of Gondar',
        content: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1400',
      },
      {
        id: 59,
        chapter_number: 6,
        title: 'Plate 6: Traditional Art & Frescoes',
        content: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=1400',
      },
    ],
  },
  {
    id: 27,
    slug: 'economics',
    title: 'Economics',
    author: 'instructor',
    category: 'Economics',
    description: 'Foundations of economic thought, market dynamics, resource allocation, and macro/micro-economic principles.',
    pages: 45,
    file_type: 'application/pdf',
    file_url: 'uploads/book-1792809130890-494732421.pdf',
    chapters: [],
  },
  {
    id: 24,
    slug: 'modern-digital-reading',
    title: 'Modern Digital Reading (Word DOCX)',
    author: 'ReadRise Research Collective',
    category: 'Education',
    description: 'An authoritative study on digital reading ergonomics, typography, cognitive retention across electronic devices, and user interface paradigms.',
    pages: 14,
    file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    file_url: 'uploads/sample-research.docx',
    chapters: [],
  },
  {
    id: 21,
    slug: 'doctrine-martin-luther',
    title: 'Doctrine Martin Luther on Baptist',
    author: 'Luther',
    category: 'Spiritual',
    description: 'A comprehensive exploration of Martin Luther\'s theological perspectives on baptism and its significance in Christian faith.',
    pages: 180,
    file_type: 'application/pdf',
    file_url: 'uploads/book-1792614508705-770305594.pdf',
    chapters: [
      {
        id: 48,
        chapter_number: 1,
        title: 'Chapter 1',
        content: 'The doctrine of baptism is one of the most fundamental teachings of the Christian faith. It represents the washing away of sins and the beginning of a new life in Christ.',
      },
      {
        id: 49,
        chapter_number: 2,
        title: 'Chapter 2',
        content: 'Martin Luther emphasized that baptism is not merely a symbol but a means of grace through which God delivers forgiveness and the Holy Spirit.',
      },
      {
        id: 50,
        chapter_number: 3,
        title: 'Chapter 3',
        content: 'The practice of infant baptism has been a topic of theological discussion for centuries.',
      },
    ],
  },
  {
    id: 22,
    slug: 'how-to-invest-money',
    title: 'How to Invest Money',
    author: 'George Henry',
    category: 'Psychology',
    description: 'A practical guide to understanding the psychology of investment and making sound financial decisions.',
    pages: 240,
    chapters: [
      {
        id: 51,
        chapter_number: 1,
        title: 'Chapter 1',
        content: 'Investing is not just about numbers and markets; it is deeply rooted in human psychology.',
      },
      {
        id: 52,
        chapter_number: 2,
        title: 'Chapter 2',
        content: 'The psychology of risk management is crucial for long-term success.',
      },
      {
        id: 53,
        chapter_number: 3,
        title: 'Chapter 3',
        content: 'Patience and discipline are the hallmarks of successful investors.',
      },
    ],
  },
  {
    id: 20,
    slug: 'src-students-management',
    title: 'SRC Students Academic Managements',
    author: 'Yerosan Girma',
    category: 'Education',
    description: 'A comprehensive guide for students on effective academic management and study strategies.',
    pages: 200,
    chapters: [
      {
        id: 45,
        chapter_number: 1,
        title: 'Chapter 1',
        content: 'Effective academic management begins with proper planning and organization.',
      },
      {
        id: 46,
        chapter_number: 2,
        title: 'Chapter 2',
        content: 'Time management is one of the most critical skills for academic success.',
      },
      {
        id: 47,
        chapter_number: 3,
        title: 'Chapter 3',
        content: 'Active learning strategies can enhance retention and understanding.',
      },
    ],
  },
];

export const getBook = (id) =>
  books.find(
    (b) =>
      b.id === id ||
      String(b.id) === String(id) ||
      b.slug === id ||
      String(b.slug) === String(id)
  );
