'use client';

import { ModalTw } from '@/components/common/ModalTw';
// import ModalTw from '@/components/common/ModalTw';
import { useState } from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

export default function ModalDocumentation() {
    const [showDefaultModal, setShowDefaultModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showLargeModal, setShowLargeModal] = useState(false);
    const [showStaticModal, setShowStaticModal] = useState(false);
    const [showPositionedModal, setShowPositionedModal] = useState(false);
    const [modalPosition, setModalPosition] = useState('center');

    const positions = ['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Modal Component</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    A flexible modal dialog built with Flowbite-React for Next.js applications
                </p>
            </div>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Examples</h2>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Default Modal */}
                    <div className="p-4 border rounded-lg dark:border-gray-700">
                        <h3 className="text-lg font-medium mb-2">Default Modal</h3>
                        <button
                            onClick={() => setShowDefaultModal(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            Open Modal
                        </button>
                        <ModalTw
                            show={showDefaultModal}
                            onClose={() => setShowDefaultModal(false)}
                            title="Default Modal"
                        >
                            <p className="text-gray-600 dark:text-gray-400">
                                This is a default modal with basic content. You can put any React components here.
                            </p>
                        </ModalTw>

                        {/* <ModalTw
                            show={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            title="Example Modal"
                            size="lg"
                            position="center"
                        >
                            <p>Your modal content here</p>
                        </ModalTw> */}
                    </div>

                    {/* Confirmation Modal */}
                    <div className="p-4 border rounded-lg dark:border-gray-700">
                        <h3 className="text-lg font-medium mb-2">Confirmation Modal</h3>
                        <button
                            onClick={() => setShowConfirmModal(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                        >
                            Delete Item
                        </button>
                        <ModalTw
                            show={showConfirmModal}
                            onClose={() => setShowConfirmModal(false)}
                            onConfirm={() => {
                                alert('Item deleted!');
                                setShowConfirmModal(false);
                            }}
                            title="Confirm Deletion"
                            type="confirmation"
                            confirmText="Yes, delete"
                        >
                            Are you sure you want to delete this item? This action cannot be undone.
                        </ModalTw>
                    </div>

                    {/* Large Modal */}
                    <div className="p-4 border rounded-lg dark:border-gray-700">
                        <h3 className="text-lg font-medium mb-2">Large Modal</h3>
                        <button
                            onClick={() => setShowLargeModal(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                        >
                            View Details
                        </button>
                        <ModalTw
                            show={showLargeModal}
                            onClose={() => setShowLargeModal(false)}
                            title="Detailed Information"
                            size="xl"
                        >
                            <div className="space-y-4">
                                <p className="text-gray-600 dark:text-gray-400">
                                    This modal demonstrates the large size option. It's useful for displaying more content.
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                    You can include forms, tables, or any other components that need more space.
                                </p>
                            </div>
                        </ModalTw>
                    </div>

                    {/* Static Modal */}
                    <div className="p-4 border rounded-lg dark:border-gray-700">
                        <h3 className="text-lg font-medium mb-2">Static Modal</h3>
                        <button
                            onClick={() => setShowStaticModal(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                            Important Action
                        </button>
                        <ModalTw
                            show={showStaticModal}
                            onClose={() => setShowStaticModal(false)}
                            title="Important Notice"
                            dismissible={false}
                        >
                            <p className="text-gray-600 dark:text-gray-400">
                                This modal cannot be closed by clicking outside. The user must explicitly click the close button.
                            </p>
                        </ModalTw>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Position Examples</h2>
                <div className="flex flex-wrap gap-2">
                    {positions.map((position) => (
                        <button
                            key={position}
                            onClick={() => {
                                setModalPosition(position);
                                setShowPositionedModal(true);
                            }}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                        >
                            {position.split('-').join(' ')}
                        </button>
                    ))}
                </div>
                <ModalTw
                    show={showPositionedModal}
                    onClose={() => setShowPositionedModal(false)}
                    title={`${modalPosition.split('-').join(' ')} Modal`}
                    position={modalPosition}
                >
                    <p className="text-gray-600 dark:text-gray-400">
                        This modal is positioned at the {modalPosition.split('-').join(' ')} of the screen.
                    </p>
                </ModalTw>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Props</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prop</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Default</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">show</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">boolean</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">false</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Controls modal visibility</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">onClose</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">function</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">required</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Callback when modal is closed</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">title</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">string</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">''</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Modal header text</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">size</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">'sm' | 'md' | 'lg' | 'xl' | '2xl'</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">'md'</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Controls modal width</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">position</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">'center'</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Modal position on screen</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">type</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">'default' | 'confirmation'</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">'default'</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Changes styling for confirmation dialogs</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">dismissible</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">boolean</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">true</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Whether clicking outside closes the modal</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">showFooter</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">boolean</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">true</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Whether to show the footer with action buttons</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">confirmText</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">string</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">'Confirm'</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Text for confirm button</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">cancelText</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">string</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">'Cancel'</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Text for cancel button</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}