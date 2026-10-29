import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Code2, Palette } from "lucide-react";
import { useAuth } from "../context/authState";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

const TECHNICAL_TALENTS = [
  "Web Development",
  "Python / Data Science",
  "Mobile App Development",
  "Cybersecurity",
  "AI / Machine Learning",
  "Cloud & DevOps",
];

const NON_TECHNICAL_TALENTS = [
  "Singing",
  "Dancing",
  "Painting / Art",
  "Photography",
  "Public Speaking",
  "Creative Writing",
];

export default function TalentSelection() {
  const navigate = useNavigate();
  const { firebaseUser, setUserTalents } = useAuth();
  const [technical, setTechnical] = useState([]);
  const [nonTechnical, setNonTechnical] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleTalent = (list, setList, talent) => {
    setList((prev) =>
      prev.includes(talent)
        ? prev.filter((t) => t !== talent)
        : [...prev, talent]
    );
  };

  const handleContinue = async () => {
    if (technical.length === 0 && nonTechnical.length === 0) {
      alert("Please select at least one talent to continue.");
      return;
    }

    setLoading(true);

    try {
      const allTalents = [...technical, ...nonTechnical];
      
      // Save to localStorage
      localStorage.setItem("userTalents", JSON.stringify(allTalents));

      // Save to Firestore if user is logged in
      if (firebaseUser) {
        await setDoc(
          doc(db, "users", firebaseUser.uid),
          { talents: allTalents },
          { merge: true }
        );
        setUserTalents(allTalents);
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving talents:", error);
      alert("Error saving talents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalSelected = technical.length + nonTechnical.length;

  return (
    <div className="min-h-screen bg-[#D1E5EA] p-6 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white rounded-3xl border-4 border-[#0F252C] shadow-xl p-8 space-y-8">

        <div className="text-center space-y-2">
          <p className="text-sm font-semibold text-[#405D66]">TalentMesh</p>
          <h1 className="text-3xl font-black text-[#0F252C]">
            What talents interest you?
          </h1>
          <p className="text-[#405D66]">
            Pick from technical, non-technical, or both. You can select as many as you like.
          </p>
        </div>

        {/* Technical */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0F252C] text-white">
              <Code2 size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F252C]">Technical</h2>
              <p className="text-sm text-[#405D66]">Coding, tech & digital skills</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {TECHNICAL_TALENTS.map((talent) => {
              const selected = technical.includes(talent);
              return (
                <button
                  key={talent}
                  type="button"
                  onClick={() => toggleTalent(technical, setTechnical, talent)}
                  disabled={loading}
                  className={`px-4 py-3 rounded-2xl font-semibold border-2 transition-all disabled:opacity-50 ${
                    selected
                      ? "bg-[#0F252C] text-white border-[#0F252C]"
                      : "bg-[#F4F7F8] text-[#0F252C] border-[#9FD3E3] hover:bg-[#D1E5EA]"
                  }`}
                >
                  {selected ? "✓ " : ""}{talent}
                </button>
              );
            })}
          </div>
        </section>

        {/* Non-Technical */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#9FD3E3] text-[#0F252C]">
              <Palette size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F252C]">Non-Technical</h2>
              <p className="text-sm text-[#405D66]">Arts, creativity & soft skills</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {NON_TECHNICAL_TALENTS.map((talent) => {
              const selected = nonTechnical.includes(talent);
              return (
                <button
                  key={talent}
                  type="button"
                  onClick={() =>
                    toggleTalent(nonTechnical, setNonTechnical, talent)
                  }
                  disabled={loading}
                  className={`px-4 py-3 rounded-2xl font-semibold border-2 transition-all disabled:opacity-50 ${
                    selected
                      ? "bg-[#0F252C] text-white border-[#0F252C]"
                      : "bg-[#F4F7F8] text-[#0F252C] border-[#9FD3E3] hover:bg-[#D1E5EA]"
                  }`}
                >
                  {selected ? "✓ " : ""}{talent}
                </button>
              );
            })}
          </div>
        </section>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-sm font-semibold text-[#405D66]">
            {totalSelected} talent{totalSelected !== 1 ? "s" : ""} selected
          </p>

          <button
            type="button"
            onClick={handleContinue}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-[#0F252C] text-white rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Continue to Dashboard →"}
          </button>
        </div>

      </div>
    </div>
  );
}
