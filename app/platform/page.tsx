/**
 * Platform Landing Page - App Directory
 * Displays all installed Bickford native apps
 */

import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";

interface AppManifest {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: string;
}

async function getInstalledApps(): Promise<AppManifest[]> {
  const manifestPath = path.join(process.cwd(), "platform/ui/manifest.json");
  const manifestContent = await fs.readFile(manifestPath, "utf-8");
  const manifest = JSON.parse(manifestContent);
  return manifest.apps;
}

export default async function PlatformPage() {
  const apps = await getInstalledApps();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            Bickford Platform
          </h1>
          <p className="text-gray-600 mt-2">
            Execution Authority for AI Systems
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <Link
              key={app.id}
              href={`/platform/${app.id}`}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {app.name}
                  </h2>
                  <p className="text-gray-600 mt-2 text-sm">
                    {app.description}
                  </p>
                </div>
                <div className="ml-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      app.status === "active"
                        ? "bg-green-100 text-green-800"
                        : app.status === "beta"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center text-sm text-gray-500">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                Open app
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900">
            Platform Status
          </h3>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-blue-600">Total Apps</p>
              <p className="text-2xl font-bold text-blue-900">{apps.length}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Active</p>
              <p className="text-2xl font-bold text-blue-900">
                {apps.filter((a) => a.status === "active").length}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Beta</p>
              <p className="text-2xl font-bold text-blue-900">
                {apps.filter((a) => a.status === "beta").length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
