import Navbar from '../components/Navbar';
import HeroSection from '../components/sections/Hero';
import FeaturedBooks from '../components/books/FeaturedBooks';
import ReadingJourney from '../components/sections/ReadingJourney';
import HowItWorks from '../components/sections/HowItWorks';
import ChallengesSection from '../components/sections/ChallengesSection';
import DashboardPreview from '../components/sections/DashboardPreview';
import LeaderboardPreview from '../components/sections/LeaderboardPreview';
import CommunitySection from '../components/sections/CommunitySection';
import FinalCTA from '../components/sections/FinalCTA';
import Footer from '../components/layout/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream-50 overflow-x-hidden" style={{ transition: 'background-color 0.3s ease' }}>
      <Navbar />
      <HeroSection />
      <FeaturedBooks />
      <HowItWorks />
      <ReadingJourney />
      <ChallengesSection />
      <DashboardPreview />
      <LeaderboardPreview />
      <CommunitySection />
      <FinalCTA id="start" />
      <Footer />
    </div>
  );
}