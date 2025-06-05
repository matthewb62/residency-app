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


  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchEmail = async () => {
        const storedEmail = localStorage.getItem("student_email");
        if (!storedEmail) {
          console.warn("No student email in localStorage.");
          return;
        }
        setUser(storedEmail);
      };

      fetchEmail();
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
    if (!user) {
      alert("Student email not loaded yet. Please wait.");
      return;
    }
    const safeEmail = encodeURIComponent(user); // replaces @ with %40
    const filePath = `${safeEmail}/${selectedCVFile.name}`;

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
       student_email: user,
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
    <div
      className="p-6 min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/jobs_board_bg.png')" }}
    >
      <h1 className="text-4xl font-bold mb-10 text-center text-white">Jobs Board</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {companies.map((company) => (
          <div key={company.company_id} className="bg-[#f5f5f5cc] p-6 rounded-2xl shadow-xl hover:shadow-2xl transition backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#004f3b' }}>
              {company.company_name}
              {company.average_rating && (
                <span className="ml-2 text-green-600 text-lg">
                  ★ {company.average_rating.toFixed(1)}
                </span>
              )}
            </h2>
            <a href={company.company_website} className="underline mb-2 block" style={{ color: '#009966' }} target="_blank" rel="noopener noreferrer">
              {company.company_website}
            </a>
            <p className="mb-2 text-sm" style={{ color: '#002c22' }}>{company.company_description}</p>
            <p className="mb-4 text-sm font-medium" style={{ color: '#004f3b' }}>{company.job_description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {company["languages/tools"]?.split(",").map((lang, idx) => (
                <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                  {lang.trim()}
                </span>
              ))}
            </div>
            <p className="mb-1 text-sm" style={{ color: '#002c22' }}><strong>Residency Duration:</strong> {company.duration}</p>
            <p className="mb-1 text-sm" style={{ color: '#002c22' }}><strong>Positions Available:</strong> {company.num_positions}</p>
            <p className="mb-1 text-sm" style={{ color: '#002c22' }}><strong>Monthly Pay:</strong> €{company.monthly_pay}</p>
            <p className="mb-4 text-sm" style={{ color: '#002c22' }}><strong>Contact:</strong> {company.contact_email}</p>
            <div className="flex justify-between mb-4">
              <button className="bg-[#009966] text-white px-4 py-2 rounded hover:bg-[#007d52] text-sm" onClick={() => openModal(company)}>Rate & Review</button>
              <button className="bg-[#004f3b] text-white px-4 py-2 rounded hover:bg-[#003d2e] text-sm" onClick={() => { setSelectedCompany(company); setShowCVModal(true); }}>Upload CV</button>
            </div>
            {company.reviews.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-2" style={{ color: '#004f3b' }}>Student Reviews:</h3>
                <div className="space-y-2">
                  {company.reviews.slice(0, 2).map((text, idx) => (
                    <div key={idx} className="bg-gray-100 p-3 rounded-lg shadow text-sm" style={{ color: '#002c22' }}>
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && selectedCompany && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center text-green-800">Review for {selectedCompany.company_name}</h2>
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={`cursor-pointer text-3xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
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
              <button className="bg-gray-300 px-4 py-2 rounded text-sm" onClick={closeModal}>Cancel</button>
              <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm" onClick={handleSubmitReview}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {showCVModal && selectedCompany && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center text-blue-800">Upload CV for {selectedCompany.company_name}</h2>
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
