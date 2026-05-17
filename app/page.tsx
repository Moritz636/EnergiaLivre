import { Navbar } from "./components/navbar";
import { Hero } from "./components/hero";
import { HowItWorks } from "./components/how-it-works";
import { SavingsSimulator } from "./components/savings-simulator";
import { Sustainability } from "./components/sustainability";
import { FinancialBenefits } from "./components/financial-benefits";
import { CtaBanner } from "./components/cta-banner";
import { Footer } from "./components/footer";

export default function Home() {
  return (
    <div className="overflow-x-hidden bg-[#030712] text-white">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <SavingsSimulator />
        <Sustainability />
        <FinancialBenefits />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
