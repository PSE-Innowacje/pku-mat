import { Routes, Route, Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Home</h1>
      <p>Welcome to PKU Mat.</p>
    </div>
  );
}

function About() {
  return (
    <div>
      <h1>About</h1>
      <p>This is the about page.</p>
    </div>
  );
}

function App() {
  return (
    <div className="app">
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
