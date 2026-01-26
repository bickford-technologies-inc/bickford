/**
 * App Screen Renderer
 * Dynamically renders screens based on JSON definitions
 */

import { promises as fs } from "fs";
import path from "path";

interface Props {
  params: { appId: string };
}

async function getAppManifest(appId: string) {
  const appPath = path.join(process.cwd(), `apps/${appId}/app.json`);
  const content = await fs.readFile(appPath, "utf-8");
  return JSON.parse(content);
}

export default async function AppPage({ params }: Props) {
  const { appId } = params;
  const manifest = await getAppManifest(appId);
  const entryScreen = manifest.screens[manifest.entryScreen];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <a
              href="/platform"
              className="text-gray-600 hover:text-gray-900 mr-4"
            >
              ← Back
            </a>
            <h1 className="text-2xl font-bold text-gray-900">
              {manifest.name}
            </h1>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              manifest.status === "active"
                ? "bg-green-100 text-green-800"
                : manifest.status === "beta"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
            }`}
          >
            {manifest.status}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {entryScreen.id}
          </h2>

          <div
            className={`grid ${
              entryScreen.layout === "split"
                ? "grid-cols-2"
                : entryScreen.layout === "grid"
                  ? "grid-cols-3"
                  : "grid-cols-1"
            } gap-6`}
          >
            {entryScreen.components.map((component: any) => (
              <div
                key={component.id}
                className="bg-gray-50 rounded p-4 border border-gray-200"
              >
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  {component.type}
                </h3>
                <p className="text-xs text-gray-500">
                  Component ID: {component.id}
                </p>
                {component.source && (
                  <p className="text-xs text-gray-500 mt-1">
                    Data Source: {component.source}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Available Actions
            </h3>
            <div className="flex gap-2">
              {Object.keys(entryScreen.actions || {}).map((action) => (
                <button
                  key={action}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Screen Definition
          </h3>
          <pre className="text-xs text-blue-800 overflow-x-auto">
            {JSON.stringify(entryScreen, null, 2)}
          </pre>
        </div>
      </main>
    </div>
  );
}
