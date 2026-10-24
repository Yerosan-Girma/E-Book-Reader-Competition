export const categories = [
  'Spiritual',
  'Psychology',
  'Education',
  'Fiction',
];

// Sample books with live backend database IDs and offline fallback data
// These demonstrate the category-based gradient system
export const books = [
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
