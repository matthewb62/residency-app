// Full working version of JobsBoard component with CV upload and review modal
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function JobsBoard() {
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [showCVModal, setShowCVModal] = useState(false);
  const [selectedCVFile, setSelectedCVFile] = useState(null);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [user, setUser] = useState(null);
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchUserAndStudentId() {
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();

      if (authError) {
        console.error("Auth error:", authError);
        return;
      }

      setUser(user);

      const { data: studentRecord, error: fetchError } = await supabase
        .from("student_account")
        .select("id")
        .eq("student_email", user.email)
        .single();

      if (fetchError) {
        console.error("Error fetching student ID:", fetchError);
      } else {
        setStudentId(studentRecord.id);
      }
    }

    fetchUserAndStudentId();
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

    const { error } = await supabase.from("reviews").insert([payload]);

    if (error) {
      console.error("❌ Supabase Insert Error:", error);
      alert("Error submitting review");
    } else {
      await fetchData();
      alert("✅ Review submitted!");
      closeModal();
    }
  };

  const handleUploadCV = async () => {
    if (!selectedCVFile || !selectedCompany) {
      alert("Please select a file.");
      return;
    }

    setUploadingCV(true);
    if (!studentId) {
      alert("Student ID not loaded yet. Please wait.");
      return;
    }
    const filePath = `${studentId}/${selectedCVFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("student-cvs")
      .upload(filePath, selectedCVFile, { upsert: true });

    if (uploadError) {
      console.error(uploadError);
      alert("File upload failed.");
      setUploadingCV(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("student-cvs").getPublicUrl(filePath);

    const { error: insertError } = await supabase.from("cvs").insert([
      {
        student_id: studentId,
        company_id: selectedCompany.company_id,
        cv_url: urlData.publicUrl,
      },
    ]);

    setUploadingCV(false);

    if (insertError) {
      console.error(insertError);
      alert("Failed to save CV entry.");
    } else {
      alert("✅ CV uploaded successfully!");
      setShowCVModal(false);
      setSelectedCVFile(null);
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
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm mb-2" onClick={() => openModal(company)}>Rate & Review</button>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm" onClick={() => { setSelectedCompany(company); setShowCVModal(true); }}>Upload CV</button>
            {company.reviews.length > 0 && (
              <div className="border-t pt-2 mt-4">
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
            <h2 className="text-xl font-bold mb-4 text-center text-green-800">Review for {selectedCompany?.company_name}</h2>
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} onClick={() => setRating(star)} className={`cursor-pointer text-3xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}>★</span>
              ))}
            </div>
            <textarea className="w-full border rounded p-2 mb-4 text-sm" placeholder="Write your review..." rows="4" value={review} onChange={(e) => setReview(e.target.value)} />
            <div className="flex justify-between">
              <button className="bg-gray-300 px-4 py-2 rounded text-sm" onClick={closeModal}>Cancel</button>
              <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm" onClick={handleSubmitReview}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {showCVModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center text-blue-800">Upload CV for {selectedCompany?.company_name}</h2>
            <input type="file" accept=".pdf" onChange={(e) => setSelectedCVFile(e.target.files[0])} className="mb-4 w-full text-sm" />
            <div className="flex justify-between">
              <button className="bg-gray-300 px-4 py-2 rounded text-sm" onClick={() => { setShowCVModal(false); setSelectedCVFile(null); }}>Cancel</button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm" onClick={handleUploadCV} disabled={uploadingCV}>{uploadingCV ? "Uploading..." : "Submit CV"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
