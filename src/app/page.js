import { Badge } from "../components/ui/badge"

export default function Home() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">MosqueConnect</h1>
      <p className="mb-4">Welcome to MosqueConnect, connecting Muslims with their local community.</p>
      <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
        <p className="text-green-800">This is a placeholder page. The full application code will be uploaded in the next deployment.</p>
      </div>
      <div className="flex gap-2 mt-4">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </div>
    </div>
  );
}
