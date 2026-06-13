import BenchmarkSubject from './components/BenchmarkSubject';

function BenchmarkApp() {
  return (
    <div
      id="benchmark-root"
      className="min-h-screen w-full bg-white text-left"
      style={{ textAlign: 'initial' }}
    >
      <BenchmarkSubject />
    </div>
  );
}

export default BenchmarkApp;
