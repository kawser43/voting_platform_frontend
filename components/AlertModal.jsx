'use client';

export default function AlertModal({ 
    isOpen, 
    title, 
    message, 
    onClose, 
    type = 'error',
    actions
}) {
    if (!isOpen) return null;

    const styles = {
        error: {
            iconBg: 'bg-indigo-100',
            iconColor: 'text-indigo-800',
            btnColor: 'bg-indigo-800 hover:bg-indigo-900',
            icon: (
                <svg className="h-6 w-6 text-indigo-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )
        },
        success: {
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            btnColor: 'bg-green-600 hover:bg-green-700',
            icon: (
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            )
        },
        info: {
            iconBg: 'bg-indigo-100',
            iconColor: 'text-indigo-600',
            btnColor: 'bg-indigo-600 hover:bg-indigo-700',
            icon: (
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    };

    const currentStyle = styles[type] || styles.info;

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-[70]">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl transform transition-all">
                <div className="text-center">
                    <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${currentStyle.iconBg} mb-4`}>
                        {currentStyle.icon}
                    </div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 mb-6">{message}</p>
                    {actions ? (
                        <div className="flex flex-col gap-3">
                            {actions}
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <button
                                onClick={onClose}
                                className={`${currentStyle.btnColor} text-white px-4 py-2 rounded-md font-medium w-full`}
                            >
                                OK
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
