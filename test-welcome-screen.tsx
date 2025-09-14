import { WelcomeScreen } from "@/components/welcome-screen";

export default function TestWelcomeScreen() {
  const handleNameSubmit = (name: string) => {
    console.log("User entered name:", name);
    // In a real app, this would navigate to the dashboard
  };

  return (
    <div>
      <h1>Test Welcome Screen</h1>
      <WelcomeScreen onNameSubmit={handleNameSubmit} />
    </div>
  );
}