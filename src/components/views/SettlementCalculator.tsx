"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Scale,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  PieChart,
  BarChart3,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Lightbulb,
  HelpCircle,
  ChevronRight,
  Percent,
  Coins,
  Banknote,
  Receipt,
  Wallet,
  X,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input, TextArea } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { cn } from "@/lib/utils";

// Types
interface ClaimComponent {
  id: string;
  name: string;
  amount: number;
  probability: number; // 0-100
  notes?: string;
}

interface CostItem {
  id: string;
  category: "legal_fees" | "court_fees" | "expert" | "travel" | "other";
  description: string;
  amount: number;
  incurred: boolean;
  recoverable: boolean;
}

interface SettlementOffer {
  id: string;
  amount: number;
  date: Date;
  from: "you" | "opponent";
  conditions?: string;
  expiry?: Date;
  notes?: string;
}

interface SettlementAnalysis {
  expectedValue: number;
  breakEvenPoint: number;
  recommendedRange: { min: number; max: number };
  riskAdjustedValue: number;
  timeValueAdjustment: number;
  recommendation: "accept" | "counter" | "reject" | "litigate";
  reasoning: string[];
}

interface SettlementCalculatorProps {
  onNavigate?: (view: string) => void;
  onAction?: (action: string, data?: any) => void;
}

export const SettlementCalculator: React.FC<SettlementCalculatorProps> = ({
  onNavigate,
  onAction,
}) => {
  // State
  const [view, setView] = React.useState<"input" | "analysis" | "history">("input");
  const [claims, setClaims] = React.useState<ClaimComponent[]>([]);
  const [costs, setCosts] = React.useState<CostItem[]>([]);
  const [offers, setOffers] = React.useState<SettlementOffer[]>([]);
  const [currentOffer, setCurrentOffer] = React.useState<number>(0);
  const [winProbability, setWinProbability] = React.useState<number>(50);
  const [timeToTrial, setTimeToTrial] = React.useState<number>(12); // months
  const [discountRate, setDiscountRate] = React.useState<number>(5); // annual %
  const [showAddClaim, setShowAddClaim] = React.useState(false);
  const [showAddCost, setShowAddCost] = React.useState(false);
  const [newClaim, setNewClaim] = React.useState<Partial<ClaimComponent>>({
    probability: 70,
  });
  const [newCost, setNewCost] = React.useState<Partial<CostItem>>({
    category: "legal_fees",
    incurred: false,
    recoverable: true,
  });

  // Sample data
  React.useEffect(() => {
    if (claims.length === 0) {
      setClaims([
        {
          id: "1",
          name: "Principal Amount",
          amount: 5000000,
          probability: 85,
          notes: "Original investment amount with clear documentation",
        },
        {
          id: "2",
          name: "Interest (Contractual)",
          amount: 750000,
          probability: 70,
          notes: "Interest at 5% from breach date",
        },
        {
          id: "3",
          name: "Consequential Damages",
          amount: 1500000,
          probability: 40,
          notes: "Lost business opportunities - harder to prove",
        },
        {
          id: "4",
          name: "Costs Recovery",
          amount: 800000,
          probability: 60,
          notes: "Estimated recoverable costs if successful",
        },
      ]);

      setCosts([
        {
          id: "1",
          category: "legal_fees",
          description: "Solicitor fees to date",
          amount: 250000,
          incurred: true,
          recoverable: true,
        },
        {
          id: "2",
          category: "legal_fees",
          description: "Estimated fees to trial",
          amount: 500000,
          incurred: false,
          recoverable: true,
        },
        {
          id: "3",
          category: "court_fees",
          description: "Filing fees and hearing fees",
          amount: 50000,
          incurred: true,
          recoverable: true,
        },
        {
          id: "4",
          category: "expert",
          description: "Expert witness (forensic accountant)",
          amount: 150000,
          incurred: false,
          recoverable: true,
        },
        {
          id: "5",
          category: "travel",
          description: "Travel to Hong Kong for hearings",
          amount: 30000,
          incurred: true,
          recoverable: false,
        },
      ]);

      setOffers([
        {
          id: "1",
          amount: 2000000,
          date: new Date("2024-06-15"),
          from: "opponent",
          conditions: "Full and final settlement, no admission of liability",
          notes: "Initial lowball offer",
        },
        {
          id: "2",
          amount: 4500000,
          date: new Date("2024-08-20"),
          from: "you",
          conditions: "Payment within 28 days, costs to be agreed",
          expiry: new Date("2024-09-20"),
        },
      ]);

      setCurrentOffer(3000000);
    }
  }, []);

  // Calculate totals
  const calculations = React.useMemo(() => {
    // Total claim value
    const totalClaim = claims.reduce((sum, c) => sum + c.amount, 0);

    // Expected value (probability weighted)
    const expectedValue = claims.reduce((sum, c) => sum + c.amount * (c.probability / 100), 0);

    // Total costs
    const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0);
    const incurredCosts = costs.filter((c) => c.incurred).reduce((sum, c) => sum + c.amount, 0);
    const futureCosts = costs.filter((c) => !c.incurred).reduce((sum, c) => sum + c.amount, 0);
    const recoverableCosts = costs.filter((c) => c.recoverable).reduce((sum, c) => sum + c.amount, 0);
    const nonRecoverableCosts = totalCosts - recoverableCosts;

    // Risk adjusted expected value
    const riskAdjustedValue = expectedValue * (winProbability / 100);

    // Time value of money adjustment
    const timeValueFactor = 1 / Math.pow(1 + discountRate / 100, timeToTrial / 12);
    const presentValue = riskAdjustedValue * timeValueFactor;

    // Break even point (minimum acceptable settlement)
    const breakEven = incurredCosts + futureCosts * 0.3; // Assume 30% of future costs saved if settle

    // Net expected value after costs
    const netExpectedValue = riskAdjustedValue - totalCosts;

    // If lose: pay own costs + potentially opponent costs
    const worstCase = -(totalCosts + recoverableCosts * 0.7); // Assume 70% of recoverable costs awarded against

    // Best case: full claim + costs recovery
    const bestCase = totalClaim + recoverableCosts - nonRecoverableCosts;

    // Calculate settlement recommendation
    const getRecommendation = (): SettlementAnalysis => {
      const offer = currentOffer;
      const reasoning: string[] = [];
      let recommendation: "accept" | "counter" | "reject" | "litigate" = "counter";

      // Compare offer to expected value
      const offerVsExpected = offer / riskAdjustedValue;
      const offerVsPresent = offer / presentValue;
      const offerVsNet = offer / (netExpectedValue > 0 ? netExpectedValue : 1);

      if (offer >= riskAdjustedValue * 0.9) {
        recommendation = "accept";
        reasoning.push(
          `Offer of ${formatCurrency(offer)} is ${Math.round(offerVsExpected * 100)}% of risk-adjusted expected value`
        );
        reasoning.push("Settlement provides certainty vs. litigation risk");
        reasoning.push("Saves future legal costs and time");
      } else if (offer >= presentValue * 0.85) {
        recommendation = "accept";
        reasoning.push(
          `Offer exceeds 85% of present value (${formatCurrency(presentValue)})`
        );
        reasoning.push("Time value of money favors early settlement");
        reasoning.push(`Avoids ${timeToTrial} months of litigation`);
      } else if (offer >= breakEven * 1.5) {
        recommendation = "counter";
        reasoning.push(
          `Offer of ${formatCurrency(offer)} is above break-even but below expected value`
        );
        reasoning.push(
          `Recommended counter: ${formatCurrency(Math.round((riskAdjustedValue + offer) / 2))}`
        );
        reasoning.push("Room for negotiation exists");
      } else if (offer >= breakEven) {
        recommendation = "counter";
        reasoning.push("Offer only slightly above break-even point");
        reasoning.push("Significant upside potential justifies continued negotiation");
        reasoning.push(`Counter with ${formatCurrency(riskAdjustedValue * 0.85)}`);
      } else {
        recommendation = "reject";
        reasoning.push(
          `Offer of ${formatCurrency(offer)} is below break-even (${formatCurrency(breakEven)})`
        );
        reasoning.push("Would not recover costs already incurred");
        reasoning.push("Better to proceed to trial unless offer improves significantly");
      }

      // Consider win probability
      if (winProbability < 40) {
        if (recommendation === "reject") recommendation = "counter";
        reasoning.push(
          `Note: Low win probability (${winProbability}%) suggests settlement may be prudent`
        );
      } else if (winProbability > 75) {
        reasoning.push(
          `Strong case (${winProbability}% win probability) supports harder negotiation`
        );
      }

      return {
        expectedValue: riskAdjustedValue,
        breakEvenPoint: breakEven,
        recommendedRange: {
          min: Math.max(breakEven * 1.2, riskAdjustedValue * 0.7),
          max: riskAdjustedValue * 0.95,
        },
        riskAdjustedValue,
        timeValueAdjustment: riskAdjustedValue - presentValue,
        recommendation,
        reasoning,
      };
    };

    return {
      totalClaim,
      expectedValue,
      totalCosts,
      incurredCosts,
      futureCosts,
      recoverableCosts,
      nonRecoverableCosts,
      riskAdjustedValue,
      presentValue,
      breakEven,
      netExpectedValue,
      worstCase,
      bestCase,
      analysis: getRecommendation(),
    };
  }, [claims, costs, winProbability, timeToTrial, discountRate, currentOffer]);

  // Format currency
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-HK", {
      style: "currency",
      currency: "HKD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Add claim
  const addClaim = () => {
    if (!newClaim.name || !newClaim.amount) return;

    const claim: ClaimComponent = {
      id: Date.now().toString(),
      name: newClaim.name,
      amount: newClaim.amount,
      probability: newClaim.probability || 50,
      notes: newClaim.notes,
    };

    setClaims((prev) => [...prev, claim]);
    setShowAddClaim(false);
    setNewClaim({ probability: 70 });
  };

  // Add cost
  const addCost = () => {
    if (!newCost.description || !newCost.amount) return;

    const cost: CostItem = {
      id: Date.now().toString(),
      category: newCost.category as CostItem["category"],
      description: newCost.description,
      amount: newCost.amount,
      incurred: newCost.incurred || false,
      recoverable: newCost.recoverable || true,
    };

    setCosts((prev) => [...prev, cost]);
    setShowAddCost(false);
    setNewCost({ category: "legal_fees", incurred: false, recoverable: true });
  };

  // Render input view
  const renderInputView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Settlement Calculator</h1>
          <p className="text-neutral-500 mt-1">
            Analyze settlement offers and make data-driven decisions
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setView("analysis")}
          icon={<BarChart3 className="w-4 h-4" />}
        >
          View Analysis
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Claims Section */}
        <Card>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-500" />
              <h2 className="font-semibold text-neutral-900">Claim Components</h2>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAddClaim(true)}
              icon={<DollarSign className="w-4 h-4" />}
            >
              Add
            </Button>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-neutral-100">
              {claims.map((claim) => (
                <div key={claim.id} className="p-4 hover:bg-neutral-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-neutral-900">{claim.name}</h3>
                      {claim.notes && (
                        <p className="text-sm text-neutral-500 mt-1">{claim.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-neutral-900">
                        {formatCurrency(claim.amount)}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {claim.probability}% likely
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${claim.probability}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-primary-50 border-t border-primary-100">
              <div className="flex justify-between items-center">
                <span className="font-medium text-primary-900">Total Claim</span>
                <span className="text-xl font-bold text-primary-700">
                  {formatCurrency(calculations.totalClaim)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1 text-sm">
                <span className="text-primary-600">Expected Value</span>
                <span className="font-medium text-primary-600">
                  {formatCurrency(calculations.expectedValue)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Costs Section */}
        <Card>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-red-500" />
              <h2 className="font-semibold text-neutral-900">Litigation Costs</h2>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAddCost(true)}
              icon={<Receipt className="w-4 h-4" />}
            >
              Add
            </Button>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
              {costs.map((cost) => (
                <div key={cost.id} className="p-4 hover:bg-neutral-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-neutral-900">{cost.description}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge
                          variant={cost.incurred ? "warning" : "default"}
                          size="sm"
                        >
                          {cost.incurred ? "Incurred" : "Future"}
                        </Badge>
                        <Badge
                          variant={cost.recoverable ? "success" : "default"}
                          size="sm"
                        >
                          {cost.recoverable ? "Recoverable" : "Non-recoverable"}
                        </Badge>
                      </div>
                    </div>
                    <div className="font-semibold text-red-600">
                      {formatCurrency(cost.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-red-50 border-t border-red-100">
              <div className="flex justify-between items-center">
                <span className="font-medium text-red-900">Total Costs</span>
                <span className="text-xl font-bold text-red-700">
                  {formatCurrency(calculations.totalCosts)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1 text-sm">
                <span className="text-red-600">Already Spent</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(calculations.incurredCosts)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settlement Offer Input */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader
          title="Current Settlement Offer"
          icon={<Banknote className="w-5 h-5 text-amber-600" />}
        />
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-amber-800 mb-2">
                Offer Amount (HKD)
              </label>
              <input
                type="number"
                value={currentOffer}
                onChange={(e) => setCurrentOffer(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-amber-300 bg-white text-xl font-semibold focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">
                Win Probability (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={winProbability}
                onChange={(e) => setWinProbability(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-amber-300 bg-white text-xl font-semibold focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">
                Time to Trial (months)
              </label>
              <input
                type="number"
                value={timeToTrial}
                onChange={(e) => setTimeToTrial(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">
                Discount Rate (% p.a.)
              </label>
              <input
                type="number"
                step={0.5}
                value={discountRate}
                onChange={(e) => setDiscountRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Analysis Preview */}
      <Card
        className={cn(
          "border-2",
          calculations.analysis.recommendation === "accept"
            ? "border-emerald-300 bg-emerald-50"
            : calculations.analysis.recommendation === "reject"
            ? "border-red-300 bg-red-50"
            : "border-amber-300 bg-amber-50"
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {calculations.analysis.recommendation === "accept" ? (
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
              ) : calculations.analysis.recommendation === "reject" ? (
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="w-6 h-6 text-red-600" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Scale className="w-6 h-6 text-amber-600" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 capitalize">
                  Recommendation: {calculations.analysis.recommendation}
                </h3>
                <p className="text-neutral-600">
                  {calculations.analysis.recommendation === "accept"
                    ? "This offer is within acceptable range"
                    : calculations.analysis.recommendation === "reject"
                    ? "This offer is too low - continue litigation or counter"
                    : "Consider a counter-offer"}
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => setView("analysis")}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Full Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render analysis view
  const renderAnalysisView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          icon={<ChevronRight className="w-4 h-4 rotate-180" />}
          onClick={() => setView("input")}
        >
          Back
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Settlement Analysis</h1>
          <p className="text-neutral-500 text-sm">
            Offer: {formatCurrency(currentOffer)} • Win Probability: {winProbability}%
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">
              {formatCurrency(calculations.riskAdjustedValue)}
            </div>
            <div className="text-sm text-neutral-500">Risk-Adjusted Value</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(calculations.breakEven)}
            </div>
            <div className="text-sm text-neutral-500">Break-Even Point</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(calculations.bestCase)}
            </div>
            <div className="text-sm text-neutral-500">Best Case (Win)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(calculations.worstCase)}
            </div>
            <div className="text-sm text-neutral-500">Worst Case (Lose)</div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendation */}
      <Card
        className={cn(
          "border-2",
          calculations.analysis.recommendation === "accept"
            ? "border-emerald-300"
            : calculations.analysis.recommendation === "reject"
            ? "border-red-300"
            : "border-amber-300"
        )}
      >
        <div
          className={cn(
            "p-4 flex items-center gap-3",
            calculations.analysis.recommendation === "accept"
              ? "bg-emerald-50"
              : calculations.analysis.recommendation === "reject"
              ? "bg-red-50"
              : "bg-amber-50"
          )}
        >
          {calculations.analysis.recommendation === "accept" ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          ) : calculations.analysis.recommendation === "reject" ? (
            <AlertTriangle className="w-6 h-6 text-red-600" />
          ) : (
            <Scale className="w-6 h-6 text-amber-600" />
          )}
          <div>
            <h2 className="font-semibold text-neutral-900 text-lg capitalize">
              Recommendation: {calculations.analysis.recommendation}
            </h2>
            <p className="text-sm text-neutral-600">
              Current offer: {formatCurrency(currentOffer)}
            </p>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="space-y-3">
            {calculations.analysis.reasoning.map((reason, i) => (
              <div key={i} className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-neutral-400 mt-1 flex-shrink-0" />
                <p className="text-neutral-700">{reason}</p>
              </div>
            ))}
          </div>

          {calculations.analysis.recommendation === "counter" && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-2">Recommended Counter-Offer Range</h3>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-sm text-blue-600">Minimum</div>
                  <div className="text-lg font-bold text-blue-900">
                    {formatCurrency(calculations.analysis.recommendedRange.min)}
                  </div>
                </div>
                <div className="flex-1 h-2 bg-blue-200 rounded-full relative">
                  <div
                    className="absolute h-full bg-blue-500 rounded-full"
                    style={{
                      left: "0%",
                      right: `${
                        100 -
                        ((calculations.analysis.recommendedRange.max -
                          calculations.analysis.recommendedRange.min) /
                          calculations.riskAdjustedValue) *
                          100
                      }%`,
                    }}
                  />
                </div>
                <div className="text-center">
                  <div className="text-sm text-blue-600">Maximum</div>
                  <div className="text-lg font-bold text-blue-900">
                    {formatCurrency(calculations.analysis.recommendedRange.max)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      <Card>
        <CardHeader title="Value Comparison" />
        <CardContent className="p-6">
          <div className="space-y-4">
            {[
              { label: "Total Claim", value: calculations.totalClaim, color: "bg-blue-500" },
              { label: "Expected Value", value: calculations.expectedValue, color: "bg-indigo-500" },
              {
                label: "Risk-Adjusted",
                value: calculations.riskAdjustedValue,
                color: "bg-purple-500",
              },
              {
                label: "Present Value",
                value: calculations.presentValue,
                color: "bg-violet-500",
              },
              { label: "Current Offer", value: currentOffer, color: "bg-amber-500" },
              { label: "Break-Even", value: calculations.breakEven, color: "bg-red-500" },
            ].map((item) => {
              const percentage = (item.value / calculations.totalClaim) * 100;
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-600">{item.label}</span>
                    <span className="font-medium text-neutral-900">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                  <div className="h-4 bg-neutral-100 rounded-full overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", item.color)}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentage, 100)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Scenario Analysis */}
      <Card>
        <CardHeader title="Scenario Comparison" />
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-emerald-900">Accept Settlement</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-emerald-700">Receive</span>
                  <span className="font-medium text-emerald-900">
                    {formatCurrency(currentOffer)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700">Costs Saved</span>
                  <span className="font-medium text-emerald-900">
                    {formatCurrency(calculations.futureCosts)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-emerald-200">
                  <span className="text-emerald-700">Net Position</span>
                  <span className="font-bold text-emerald-900">
                    {formatCurrency(currentOffer - calculations.incurredCosts)}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Certainty</span>
                  <span className="font-medium">100%</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Continue to Trial</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Expected Recovery</span>
                  <span className="font-medium text-blue-900">
                    {formatCurrency(calculations.riskAdjustedValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Additional Costs</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(calculations.futureCosts)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-200">
                  <span className="text-blue-700">Net Expected</span>
                  <span className="font-bold text-blue-900">
                    {formatCurrency(calculations.netExpectedValue)}
                  </span>
                </div>
                <div className="flex justify-between text-blue-600">
                  <span>Win Probability</span>
                  <span className="font-medium">{winProbability}%</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-5 h-5 text-neutral-600" />
                <h3 className="font-semibold text-neutral-900">Comparison</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Settlement vs Trial</span>
                  <span
                    className={cn(
                      "font-medium",
                      currentOffer - calculations.incurredCosts >
                        calculations.netExpectedValue
                        ? "text-emerald-600"
                        : "text-red-600"
                    )}
                  >
                    {currentOffer - calculations.incurredCosts > calculations.netExpectedValue
                      ? "Settlement Better"
                      : "Trial Better"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Difference</span>
                  <span className="font-medium text-neutral-900">
                    {formatCurrency(
                      Math.abs(
                        currentOffer -
                          calculations.incurredCosts -
                          calculations.netExpectedValue
                      )
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200">
                  <span className="text-neutral-600">Time Saved</span>
                  <span className="font-medium text-neutral-900">{timeToTrial} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Risk Eliminated</span>
                  <span className="font-medium text-neutral-900">
                    {100 - winProbability}% loss risk
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Settlement Negotiation Tips</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Consider a Calderbank offer to shift costs risk to opponent</li>
                <li>• Document your analysis to support costs claims if rejected</li>
                <li>• Factor in non-monetary costs: stress, time, reputation</li>
                <li>• A certain settlement often beats an uncertain trial outcome</li>
                <li>• Consider phased payments if lump sum is problematic</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Add Claim Modal
  const renderAddClaimModal = () => (
    <AnimatePresence>
      {showAddClaim && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddClaim(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Add Claim Component</h2>

              <div className="space-y-4">
                <Input
                  label="Claim Name"
                  placeholder="e.g., Principal Amount"
                  value={newClaim.name || ""}
                  onChange={(e) => setNewClaim({ ...newClaim, name: e.target.value })}
                />

                <Input
                  label="Amount (HKD)"
                  type="number"
                  placeholder="e.g., 1000000"
                  value={newClaim.amount?.toString() || ""}
                  onChange={(e) => setNewClaim({ ...newClaim, amount: Number(e.target.value) })}
                />

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Success Probability: {newClaim.probability}%
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={newClaim.probability || 50}
                    onChange={(e) => setNewClaim({ ...newClaim, probability: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <TextArea
                  label="Notes"
                  placeholder="Why this probability estimate?"
                  rows={2}
                  value={newClaim.notes || ""}
                  onChange={(e) => setNewClaim({ ...newClaim, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="ghost" className="flex-1" onClick={() => setShowAddClaim(false)}>
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1" onClick={addClaim}>
                  Add Claim
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Add Cost Modal
  const renderAddCostModal = () => (
    <AnimatePresence>
      {showAddCost && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddCost(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Add Cost Item</h2>

              <div className="space-y-4">
                <Input
                  label="Description"
                  placeholder="e.g., Solicitor fees"
                  value={newCost.description || ""}
                  onChange={(e) => setNewCost({ ...newCost, description: e.target.value })}
                />

                <Input
                  label="Amount (HKD)"
                  type="number"
                  placeholder="e.g., 100000"
                  value={newCost.amount?.toString() || ""}
                  onChange={(e) => setNewCost({ ...newCost, amount: Number(e.target.value) })}
                />

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Category</label>
                  <select
                    value={newCost.category}
                    onChange={(e) => setNewCost({ ...newCost, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200"
                  >
                    <option value="legal_fees">Legal Fees</option>
                    <option value="court_fees">Court Fees</option>
                    <option value="expert">Expert Witness</option>
                    <option value="travel">Travel</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newCost.incurred}
                      onChange={(e) => setNewCost({ ...newCost, incurred: e.target.checked })}
                      className="rounded border-neutral-300"
                    />
                    <span className="text-sm text-neutral-700">Already incurred</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newCost.recoverable}
                      onChange={(e) => setNewCost({ ...newCost, recoverable: e.target.checked })}
                      className="rounded border-neutral-300"
                    />
                    <span className="text-sm text-neutral-700">Recoverable</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="ghost" className="flex-1" onClick={() => setShowAddCost(false)}>
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1" onClick={addCost}>
                  Add Cost
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <AnimatePresence mode="wait">
        {view === "input" && renderInputView()}
        {view === "analysis" && renderAnalysisView()}
      </AnimatePresence>
      {renderAddClaimModal()}
      {renderAddCostModal()}
    </div>
  );
};
