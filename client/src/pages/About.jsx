export default function About() {
    return (
        <div className="max-w-4xl mx-auto py-20 text-center space-y-12">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Artyologist</h1>
            <p className="text-2xl text-gray-500">Creator of PickWise</p>

            <div className="p-12 bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-xl">
                <p className="text-xl leading-relaxed text-gray-600 dark:text-gray-300">
                    "Building the future of content curation, one node at a time."
                </p>
            </div>
        </div>
    );
}
