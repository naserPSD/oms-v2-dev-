// src/app/docs/button/page.jsx
"use client";

import ButtonTw from '@/components/ui/ButtonTw2';
import { FiPlus, FiTrash2, FiDownload, FiMail, FiArrowRight } from 'react-icons/fi';
import { ComponentNameContext } from "../layout";
import { useContext, useEffect } from 'react';

export default function ButtonPage() {
    const { componentName, setComponentName } = useContext(ComponentNameContext);

    useEffect(() => {
        setComponentName("ButtonTw2");
    }, [setComponentName]);

    return (
        <div className="space-y-8 max-w-fit mx-auto my-3">
            <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-400">
                    A highly customizable button component with multiple variants, sizes, and states.
                </p>
            </div>

            <div className="space-y-6">
                {/* Basic Buttons */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Basic Variants</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw>Default</ButtonTw>
                        <ButtonTw variant="alternative">Alternative</ButtonTw>
                        <ButtonTw variant="dark">Dark</ButtonTw>
                        <ButtonTw variant="light">Light</ButtonTw>
                        <ButtonTw variant="green">Green</ButtonTw>
                        <ButtonTw variant="red">Red</ButtonTw>
                        <ButtonTw variant="yellow">Yellow</ButtonTw>
                        <ButtonTw variant="purple">Purple</ButtonTw>
                    </div>
                </section>

                {/* Outline Buttons */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Outline Variants</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw variant="outline-blue">Blue</ButtonTw>
                        <ButtonTw variant="outline-gray">Gray</ButtonTw>
                        <ButtonTw variant="outline-green">Green</ButtonTw>
                        <ButtonTw variant="outline-red">Red</ButtonTw>
                        <ButtonTw variant="outline-yellow">Yellow</ButtonTw>
                        <ButtonTw variant="outline-purple">Purple</ButtonTw>
                    </div>
                </section>

                {/* Gradient Buttons */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Gradient Buttons</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw gradient variant="blue">
                            Blue Gradient
                        </ButtonTw>
                        <ButtonTw gradient variant="purpleToBlue">
                            Purple to Blue
                        </ButtonTw>
                        <ButtonTw gradient variant="greenToBlue">
                            Green to Blue
                        </ButtonTw>
                        <ButtonTw gradient variant="redToYellow">
                            Red to Yellow
                        </ButtonTw>
                    </div>
                </section>

                {/* Bordered Gradient */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Bordered Gradient</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw variant="borderedGradient-purpleToBlue">
                            Purple to Blue
                        </ButtonTw>
                        <ButtonTw variant="borderedGradient-cyanToBlue">
                            Cyan to Blue
                        </ButtonTw>
                        <ButtonTw variant="borderedGradient-pinkToOrange">
                            Pink to Orange
                        </ButtonTw>
                    </div>
                </section>

                {/* Social Buttons */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Social Buttons</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw variant="social-facebook">Facebook</ButtonTw>
                        <ButtonTw variant="social-twitter">Twitter</ButtonTw>
                        <ButtonTw variant="social-github">GitHub</ButtonTw>
                        <ButtonTw variant="social-google">Google</ButtonTw>
                    </div>
                </section>

                {/* Sizes */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Sizes</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw size="xs">Extra Small</ButtonTw>
                        <ButtonTw size="sm">Small</ButtonTw>
                        <ButtonTw size="base">Base</ButtonTw>
                        <ButtonTw size="lg">Large</ButtonTw>
                        <ButtonTw size="xl">Extra Large</ButtonTw>
                    </div>
                </section>

                {/* With Icons */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">With Icons</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw icon={<FiPlus />}>Add Item</ButtonTw>
                        <ButtonTw icon={<FiDownload />} variant="green">
                            Download
                        </ButtonTw>
                        <ButtonTw icon={<FiMail />} iconPosition="right">
                            Send Email
                        </ButtonTw>
                        <ButtonTw icon={<FiTrash2 />} variant="red">
                            Delete
                        </ButtonTw>
                    </div>
                </section>

                {/* With Badges */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">With Badges</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw badge="3">Notifications</ButtonTw>
                        <ButtonTw badge="new" variant="green">
                            Messages
                        </ButtonTw>
                        <ButtonTw badge="!" variant="red">
                            Alerts
                        </ButtonTw>
                    </div>
                </section>

                {/* States */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">States</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw disabled>Disabled</ButtonTw>
                        <ButtonTw loading>Loading</ButtonTw>
                        <ButtonTw disabled loading>
                            Disabled Loading
                        </ButtonTw>
                    </div>
                </section>

                {/* Customization */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Customization</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw className="uppercase font-bold">Uppercase</ButtonTw>
                        <ButtonTw className="rounded-none">No Radius</ButtonTw>
                        <ButtonTw className="shadow-xl">Extra Shadow</ButtonTw>
                        <ButtonTw className="w-48">Fixed Width</ButtonTw>
                    </div>
                </section>
            </div>
        </div>
    );
}