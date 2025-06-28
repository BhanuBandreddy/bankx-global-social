import { WorkflowGlobalFeed } from "@/components/WorkflowGlobalFeed";
import { AuthNavbar } from "@/components/AuthNavbar";
import { LocaleLensDemo } from "@/components/LocaleLensDemo";

export default function Workflow() {
  return (
    <div className="min-h-screen bg-white">
      <AuthNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-4">
              Global Social Commerce Workflow
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the complete flow: Browse social feed → Select product → Create escrow → Choose delivery options
            </p>
          </div>
          
          <div className="space-y-6">
            <LocaleLensDemo destination="Tokyo" />
            <WorkflowGlobalFeed />
          </div>
        </div>
      </div>
    </div>
  );
}