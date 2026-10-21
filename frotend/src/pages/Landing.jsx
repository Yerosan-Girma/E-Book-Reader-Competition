import Navbar from '../components/Navbar';
import HeroSection from '../components/hero/HeroSection';
import FeaturedBooks from '../components/books/FeaturedBooks';
import ReadingJourney from '../components/sections/ReadingJourney';
import ReadingMoment from '../components/sections/ReadingMoment';
import ChallengesSection from '../components/sections/ChallengesSection';
import DashboardPreview from '../components/sections/DashboardPreview';
import LeaderboardPreview from '../components/sections/LeaderboardPreview';
import CommunitySection from '../components/sections/CommunitySection';
import FinalCTA from '../components/sections/FinalCTA';
import Footer from '../components/layout/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream-50 overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <FeaturedBooks />
      <ReadingJourney />
      <ReadingMoment />
      <ChallengesSection />
      <DashboardPreview />
      <LeaderboardPreview />
      <CommunitySection />
      <FinalCTA id="get-started" />
      <Footer />
    </div>
  );
}