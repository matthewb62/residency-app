import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function JobsBoard() {
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [{ data: companies, error: companiesError }, { avgMap, reviewsMap }] = await Promise.all([
      supabase.from("company_data").select("*"),
      fetchRatings()
    ]);

    if (companiesError) {
      console.error("Error fetching companies:", companiesError);
      return;
    }

    const enrichedCompanies = companies.map((c) => ({
      ...c,
      average_rating: avgMap[c.company_id] || null,
      reviews: reviewsMap[c.company_id] || []
    }));

    enrichedCompanies.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    setCompanies(enrichedCompanies);
  }

  async function fetchRatings() {
    const { data, error } = await supabase
      .from("reviews")
      .select("company_id, rating, review");

    if (error) {
      console.error("Error fetching ratings:", error);
      return { avgMap: {}, reviewsMap: {} };
    }

    const ratingMap = {};
    const countMap = {};
    const reviewsMap = {};

    data.forEach(({ company_id, rating, review }) => {
      if (!ratingMap[company_id]) {
        ratingMap[company_id] = 0;
        countMap[company_id] = 0;
        reviewsMap[company_id] = [];
      }
      ratingMap[company_id] += rating;
      countMap[company_id] += 1;
      reviewsMap[company_id].push(review);
    });

    const avgMap = {};
    Object.keys(ratingMap).forEach((id) => {
      avgMap[id] = ratingMap[id] / countMap[id];
    });

    return { avgMap, reviewsMap };
  }

  const openModal = (company) => {
    setSelectedCompany(company);
    setRating(0);
    setReview("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCompany(null);
  };

  const handleSubmitReview = async () => {
    if (!rating || !review.trim()) return alert("Please enter a rating and review.");

    const payload = {
      company_id: selectedCompany?.company_id,
      rating,
      review,
    };

    console.log("🔄 Submitting review payload:", payload);

    const { error } = await supabase.from("reviews").insert([payload]);

    if (error) {
      console.error("❌ Supabase Insert Error:");
      console.error("Message:", error.message);
      console.error("Details:", error.details);
      console.error("Hint:", error.hint);
      alert("Error submitting review");
    } else {
      await fetchData(); // refresh to show new review
      alert("✅ Review submitted!");
      closeModal();
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-green-700">🧭 Jobs Board</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div key={company.company_id} className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h2 className="text-2xl font-bold mb-2 text-green-800">
              {company.company_name}
              {company.average_rating && (
                <span className="ml-2 text-green-600 text-lg">
                  ★ {company.average_rating.toFixed(1)}
                </span>
              )}
            </h2>
            <a href={company.company_website} className="text-green-600 underline mb-2 block" target="_blank" rel="noopener noreferrer">
              {company.company_website}
            </a>
            <p className="mb-2 text-sm text-gray-700">{company.company_description}</p>
            <p className="mb-4 text-sm text-gray-800 font-medium">{company.job_description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {company["languages/tools"]?.split(",").map((lang, idx) => (
                <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                  {lang.trim()}
                </span>
              ))}
            </div>
            <p className="mb-1 text-sm"><strong>Residency Duration:</strong> {company.duration}</p>
            <p className="mb-1 text-sm"><strong>Positions Available:</strong> {company.num_positions}</p>
            <p className="mb-4 text-sm"><strong>Contact:</strong> {company.contact_email}</p>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm mb-4"
              onClick={() => openModal(company)}
            >
              Rate & Review
            </button>
            {company.reviews.length > 0 && (
              <div className="border-t pt-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Student Reviews:</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600">
                  {company.reviews.map((text, idx) => (
                    <li key={idx}>{text}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center text-green-800">
              Review for {selectedCompany?.company_name}
            </h2>
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={`cursor-pointer text-3xl ${
                    star <= rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              className="w-full border rounded p-2 mb-4 text-sm"
              placeholder="Write your review..."
              rows="4"
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
            <div className="flex justify-between">
              <button
                className="bg-gray-300 px-4 py-2 rounded text-sm"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
                onClick={handleSubmitReview}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}