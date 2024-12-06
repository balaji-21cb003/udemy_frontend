import { useState, useEffect, useCallback } from "react";
import debounce from "lodash/debounce";

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    level: "",
    subject: "",
    minPrice: "",
    maxPrice: "",
    isPaid: "",
  });
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const coursesPerPage = 15;
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortPrice, setSortPrice] = useState("");
  const [subjectStats, setSubjectStats] = useState([]);
  const [searchForm, setSearchForm] = useState({
    searchTerm: "",
    subject: "",
    minPrice: "",
    maxPrice: "",
    sortPrice: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: "",
    subject: "",
    minPrice: "",
    maxPrice: "",
    sortPrice: "",
  });

  const debouncedSearch = useCallback(
    debounce((filters) => {
      setAppliedFilters(filters);
    }, 3000),
    []
  );

  const handleInputChange = (field, value) => {
    const newFilters = { ...searchForm, [field]: value };
    setSearchForm(newFilters);
    debouncedSearch(newFilters);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setAppliedFilters(searchForm);
  };

  useEffect(() => {
    fetchFilters();
    fetchCourses();
  }, [appliedFilters]);

  const fetchFilters = async () => {
    try {
      const [subjectsRes, levelsRes] = await Promise.all([
        fetch("http://localhost:5000/api/subjects"),
        fetch("http://localhost:5000/api/levels"),
      ]);
      const subjectsData = await subjectsRes.json();
      const levelsData = await levelsRes.json();
      setSubjects(subjectsData);
      setLevels(levelsData);
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    const queryParams = new URLSearchParams({
      search: appliedFilters.searchTerm,
      subject: appliedFilters.subject,
      minPrice: appliedFilters.minPrice,
      maxPrice: appliedFilters.maxPrice,
      sortPrice: appliedFilters.sortPrice,
    });

    try {
      const response = await fetch(
        `http://localhost:5000/api/courses?${queryParams}`
      );
      const data = await response.json();
      setCourses(data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
    setLoading(false);
  };

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(courses.length / coursesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const fetchSubjectStats = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/subjects-with-counts"
      );
      const data = await response.json();
      setSubjectStats(data);
    } catch (error) {
      console.error("Error fetching subject stats:", error);
    }
  };

  useEffect(() => {
    fetchSubjectStats();
  }, []);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white rounded-xl shadow-lg mb-8"
      >
        <div className="p-4 sm:p-6 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchForm.searchTerm}
              onChange={(e) => handleInputChange("searchTerm", e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-200 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                       transition-all duration-200"
            />
            <span
              className="absolute left-4 top-1/2 transform -translate-y-1/2 
                           text-gray-400 material-icons"
            ></span>
            {searchForm.searchTerm !== appliedFilters.searchTerm && (
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div
                  className="animate-spin rounded-full h-5 w-5 border-2 
                              border-blue-500 border-t-transparent"
                ></div>
              </span>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Subject</h3>
              <select
                value={searchForm.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 
                         focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Price Range</h3>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={searchForm.minPrice}
                  onChange={(e) =>
                    handleInputChange("minPrice", e.target.value)
                  }
                  className="w-1/2 px-3 py-2 rounded-lg border border-gray-200 
                           focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={searchForm.maxPrice}
                  onChange={(e) =>
                    handleInputChange("maxPrice", e.target.value)
                  }
                  className="w-1/2 px-3 py-2 rounded-lg border border-gray-200 
                           focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Sort by Price</h3>
              <select
                value={searchForm.sortPrice}
                onChange={(e) => handleInputChange("sortPrice", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 
                         focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Default</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg 
                       hover:bg-blue-600 transition-colors duration-200
                       focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Apply Filters
            </button>

            <button
              type="button"
              onClick={() => {
                const emptyFilters = {
                  searchTerm: "",
                  subject: "",
                  minPrice: "",
                  maxPrice: "",
                  sortPrice: "",
                };
                setSearchForm(emptyFilters);
                setAppliedFilters(emptyFilters);
              }}
              className="px-6 py-2 bg-red-500 text-white rounded-lg 
                       hover:bg-red-600 transition-colors duration-200
                       focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentCourses.map((course) => (
          <div
            key={course.course_id}
            className="bg-white rounded-xl shadow-lg overflow-hidden
                     transform transition-all duration-300 hover:scale-105
                     hover:shadow-xl border border-gray-100"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                {course.course_title}
              </h3>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="material-icons text-blue-500 mr-2">
                    people
                  </span>
                  {course.num_subscribers.toLocaleString()} students
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <span className="material-icons text-green-500 mr-2">
                    star
                  </span>
                  {course.num_reviews.toLocaleString()} reviews
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <span className="material-icons text-purple-500 mr-2">
                    play_circle
                  </span>
                  {course.num_lectures} lectures
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">
                      ${course.price}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm
                      ${
                        course.is_paid
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {course.is_paid ? "Premium" : "Free"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center items-center space-x-4">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
          className={`flex items-center px-6 py-3 rounded-lg transition-colors duration-200 font-medium
                     ${
                       currentPage === 1
                         ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                         : "bg-blue-500 hover:bg-blue-600 text-white"
                     }`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
          Previous
        </button>

        <span className="text-gray-600">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
          className={`flex items-center px-6 py-3 rounded-lg transition-colors duration-200 font-medium
                     ${
                       currentPage === totalPages
                         ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                         : "bg-blue-500 hover:bg-blue-600 text-white"
                     }`}
        >
          Next
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 ml-2" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default CourseList;
