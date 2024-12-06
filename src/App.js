import CourseList from './component/courselist.js';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Udemy Courses</h1>
        <CourseList />
      </div>
    </div>
  );
}

export default App;
