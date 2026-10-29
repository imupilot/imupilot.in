import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, X, Sparkles, Zap, Shield, Crown } from "lucide-react";
import UpgradeModal from "./UpgradeModal";
import { supabase } from "../supabaseClient";

export const Pricing = () => {
  const navigate = useNavigate();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [plan, setPlan] = useState("free");
  const [userId, setUserId] = useState<string | null>(null);

  const localUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const fetchUserPlan = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentAuthUser = authData?.user;

      if (currentAuthUser) {
        setUserId(currentAuthUser.id);
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", currentAuthUser.id)
          .maybeSingle();

        if (profile?.plan) {
          setPlan(profile.plan.toLowerCase());
          return;
        }
      }

      if (localUser?.plan) {
        setPlan(localUser.plan.toLowerCase());
      }
      if (localUser?.id) {
        setUserId(localUser.id);
      }
    } catch (err) {
      console.error("Error fetching user plan:", err);
      if (localUser?.plan) {
        setPlan(localUser.plan.toLowerCase());
      }
    }
  };

  useEffect(() => {
    fetchUserPlan();
  }, []);

  const isPro = plan === "pro" || plan === "pro_max";
  const isLoggedIn = Boolean(userId || localUser);

  const handleProClick = () => {
    if (!isLoggedIn) {
      navigate("/pricing");
    } else {
      setShowUpgrade(true);
    }
  };

  return (
    <section id="pricing" className="container py-20 sm:py-24">
      {/* Heading */}
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700 mb-3">
          <Shield className="h-3.5 w-3.5 text-slate-700" /> Transparent Pricing
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Simple Pricing
        </h2>
        <p className="mt-3 text-base text-slate-600 sm:text-lg">
          Everything you need to crack IMUCET
        </p>
      </div>

      {/* Two Cards Layout */}
      <div className="mt-12 grid gap-8 max-w-4xl mx-auto md:grid-cols-2 items-stretch">
        {/* ── FREE CARD ── */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-md">
          <div>
            <div className="mb-4">
              <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
                Free Plan
              </span>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">Free</h3>
              <p className="text-sm text-slate-500 mt-1">
                Essential tools to kickstart your IMUCET preparation.
              </p>
            </div>

            <div className="mb-6 border-b border-slate-100 pb-5">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900">₹0</span>
                <span className="text-sm text-slate-500 font-medium">forever</span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3.5 text-sm">
              {[
                { text: "1 Free Mock Test", included: true },
                { text: "Limited Flashcards", included: true },
                { text: "Dashboard & Analytics", included: true },
                { text: "Study Planner", included: true },
                { text: "All Mock Tests (19+ sets)", included: false },
                { text: "Sectional Tests", included: false },
                { text: "Notes & Blueprints", included: false },
                { text: "10 Complimentary Mock Interviews", included: false },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  {item.included ? (
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                      <X className="h-3 w-3 stroke-[2.5]" />
                    </div>
                  )}
                  <span className={item.included ? "text-slate-800" : "text-slate-400 line-through"}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4">
            {isLoggedIn ? (
              <div className="w-full text-center py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                {!isPro ? "Current Active Plan" : "Standard Baseline"}
              </div>
            ) : (
              <Link
                to="/auth"
                className="block w-full text-center py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-800 transition"
              >
                Get Started Free
              </Link>
            )}
          </div>
        </div>

        {/* ── PRO CARD (HIGHLIGHTED) ── */}
        <div className="relative flex flex-col justify-between rounded-2xl border-2 border-slate-900 bg-white p-8 shadow-xl">
          {/* Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-amber-400" /> Most Popular
          </div>

          <div>
            <div className="mb-4 mt-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-900">
                <Crown className="h-3 w-3 text-slate-900" /> Full Access
              </span>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">Pro</h3>
              <p className="text-sm text-slate-500 mt-1">
                The complete IMUCET &amp; DNS sponsorship mastery toolkit.
              </p>
            </div>

            <div className="mb-6 border-b border-slate-100 pb-5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-slate-900">₹999</span>
                <span className="text-sm text-slate-600 font-semibold">one-time</span>
              </div>
              <p className="mt-1 text-xs font-medium text-emerald-600">
                Unlimited lifetime validity • No recurring fees
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3.5 text-sm">
              {[
                "All Mock Tests (19+ sets, updated regularly)",
                "Sectional Tests",
                "Full Notes & Chapter PDFs",
                "All Flashcards",
                "Dashboard & Analytics",
                "Study Planner",
                "10 Complimentary Mock Interviews",
                "Priority Support",
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span className="text-slate-800 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4">
            {isPro ? (
              <div className="w-full text-center py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-700 flex items-center justify-center gap-2">
                <Check className="h-4 w-4 stroke-[3]" /> You're on Pro
              </div>
            ) : (
              <button
                type="button"
                onClick={handleProClick}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="h-4 w-4" /> Upgrade to Pro — ₹999
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => {
          setShowUpgrade(false);
          fetchUserPlan();
        }}
        userId={userId || undefined}
        title="Upgrade to IMUPilot Pro"
        subtitle="Instant access to all 19+ mock tests, notes, sectional tests, and mock interviews"
      />
    </section>
  );
};
