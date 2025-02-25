import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function EditProfilePage({
  searchParams,
}: {
  searchParams: { message?: string; success?: string };
}) {
  const supabase = await createClient();

  // Get the user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user profile
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!userProfile) {
    return redirect("/protected/profile-setup");
  }

  // Fetch all programs for the dropdown
  const { data: programs } = await supabase
    .from("programs")
    .select("id, program_name")
    .order("program_name");

  // Handle form submission
  const updateProfile = async (formData: FormData) => {
    "use server";
    
    const firstName = formData.get("first_name") as string;
    const lastName = formData.get("last_name") as string;
    const studentNumber = formData.get("student_number") as string;
    const programId = parseInt(formData.get("program_id") as string);
    const targetAverage = parseInt(formData.get("target_average") as string);

    if (!firstName || !lastName || !studentNumber || !programId) {
      return redirect("/protected/profile/edit?message=All fields are required");
    }

    // Create Supabase client inside the server action
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return redirect("/sign-in");
    }

    // Update user profile in the database
    const { error } = await supabase
      .from("user_profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        student_number: studentNumber,
        program_id: programId,
        target_average: targetAverage || null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      return redirect(`/protected/profile/edit?message=${encodeURIComponent(error.message)}`);
    }

    // Revalidate the profile page to refresh the data
    revalidatePath("/protected/profile");
    
    return redirect("/protected/profile?success=Profile updated successfully");
  };

  return (
    <main className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex flex-col items-center justify-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600">
            Edit Profile
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl text-center">
            Update your personal and academic information
          </p>
        </div>

        {searchParams?.message && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {searchParams.message}
          </div>
        )}

        {searchParams?.success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {searchParams.success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="p-6">
            <form action={updateProfile}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    defaultValue={userProfile.first_name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    required
                    defaultValue={userProfile.last_name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="student_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Student Number
                  </label>
                  <input
                    id="student_number"
                    name="student_number"
                    type="text"
                    required
                    defaultValue={userProfile.student_number}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="program_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Program
                  </label>
                  <select
                    id="program_id"
                    name="program_id"
                    required
                    defaultValue={userProfile.program_id}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select a program</option>
                    {programs?.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.program_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="target_average" className="block text-sm font-medium text-gray-700 mb-1">
                    Target Average
                  </label>
                  <input
                    id="target_average"
                    name="target_average"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={userProfile.target_average || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-200">
                <Link href="/protected/profile">
                  <button 
                    type="button"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Cancel
                  </button>
                </Link>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
} 