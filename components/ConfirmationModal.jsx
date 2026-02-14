'use client';

export default function ConfirmationModal({ 
    isOpen, 
    title, 
    message, 
    onConfirm, 
    onCancel, 
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmColor = 'indigo' // indigo, red, green
}) {
    if (!isOpen) return null;

    const colorClasses = {
        indigo: 'bg-indigo-600 hover:bg-indigo-700',
        red: 'bg-indigo-800 hover:bg-indigo-900', // Mapped Red to Navy
        green: 'bg-green-600 hover:bg-green-700',
    };

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl transform transition-all">
                <div className="text-center">
                    <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-${confirmColor}-100 mb-4`}>
                        <svg className={`h-6 w-6 text-${confirmColor}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 mb-6">{message}</p>
                    <div className="flex justify-center space-x-3">
                        <button
                            onClick={onCancel}
                            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 font-medium"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`${colorClasses[confirmColor] || colorClasses.indigo} text-white px-4 py-2 rounded-md font-medium`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
