function WelcomeContent() {
  return (
    <div className="h-screen flex items-center justify-center bg-primary w-full gr">
      <div className="flex flex-col gap-2">
        <img src="./techh.svg" alt="logo" className="w-128 h-56" />
        <h1 className="text-white text-6xl font-semibold text-center">WealthWise</h1>
        <p className="text-gray-300 text-sm">
        WealthWise
        </p>
      </div>
    </div>
  );
}

export default WelcomeContent;
