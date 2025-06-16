
import { Navbar } from "@/components/Navbar";
import { DemoFlow } from "@/components/DemoFlow";

const Demo = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8">
        <DemoFlow />
      </div>
    </div>
  );
};

export default Demo;
