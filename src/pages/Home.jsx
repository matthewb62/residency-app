
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Home() {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const email = localStorage.getItem("student_email");
            if (!email) return;

            const { data, error } = await supabase
                .from("student_account")
                .select("name")
                .eq("student_email", email)
                .single();

            if (error) {
                console.error("Error fetching user data:", error.message);
            } else {
                setUserData(data);
            }
        };

        fetchUser();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold">
                🏠{" "}
                {userData
                    ? `${userData.name}, welcome to the Residency Portal`
                    : "Loading..."}
            </h1>
            <p className="mt-4">Use the navigation bar to access your section.</p>
        </div>

    );
}
