// src/app/docs/components/button/page.jsx
"use client";

import { ButtonTw } from "@/components/ui/ButtonTw";
import {
    FiPlus,
    FiEdit,
    FiDownload,
    FiMail,
    FiArrowRight,
    FiGithub,
    FiTwitter,
} from "react-icons/fi";
import { FaFacebook, FaGoogle, FaBitcoin } from "react-icons/fa";
import { useContext, useEffect } from "react";
import { ComponentNameContext } from "../layout";

export default function ButtonPage() {
    const { componentName, setComponentName } = useContext(ComponentNameContext);

    useEffect(() => {
        setComponentName("ButtonTw");
    }, [setComponentName]);

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-400">
                    A highly customizable button component with multiple variants, sizes, and states.
                </p>
            </div>

            <div className="space-y-6">
                {/* Basic Usage */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Basic Usage</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw onClick={() => navigator.clipboard.writeText(`<ButtonTw>Default Button</ButtonTw>`)}>Default Button</ButtonTw>
                        <ButtonTw variant="green" onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="green">Success</ButtonTw>`)}>Success</ButtonTw>
                        <ButtonTw variant="red" onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="red">Danger</ButtonTw>`)}>Danger</ButtonTw>
                    </div>
                </section>

                {/* Variants */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Color Variants</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw variant="default" onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="default">Default</ButtonTw>`)}>Default</ButtonTw>
                        <ButtonTw variant="alternative" onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="alternative">Alternative</ButtonTw>`)}>Alternative</ButtonTw>
                        <ButtonTw variant="dark" onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="dark">Dark</ButtonTw>`)}>Dark</ButtonTw>
                        <ButtonTw variant="light" onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="light">Light</ButtonTw>`)}>Light</ButtonTw>
                        <ButtonTw variant="green" onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="green">Green</ButtonTw>`)}>Green</ButtonTw>
                        <ButtonTw variant="red" onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="red">Red</ButtonTw>`)}>Red</ButtonTw>
                        <ButtonTw variant="yellow" onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="yellow">Yellow</ButtonTw>`)}>Yellow</ButtonTw>
                        <ButtonTw variant="purple" onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="purple">Purple</ButtonTw>`)}>Purple</ButtonTw>
                    </div>
                </section>

                {/* Outline Variants */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Outline Variants</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw variant="outline.blue" onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="outline.blue">Blue</ButtonTw>`)}>Blue</ButtonTw>
                        <ButtonTw variant="outline.gray" onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="outline.gray">Gray</ButtonTw>`)}>Gray</ButtonTw>
                        <ButtonTw variant="outline.green" onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="outline.green">Green</ButtonTw>`)}>Green</ButtonTw>
                        <ButtonTw variant="outline.red" onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="outline.red">Red</ButtonTw>`)}>Red</ButtonTw>
                        <ButtonTw variant="outline.yellow" onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="outline.yellow">Yellow</ButtonTw>`)}>Yellow</ButtonTw>
                        <ButtonTw variant="outline.purple" onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="outline.purple">Purple</ButtonTw>`)}>Purple</ButtonTw>
                    </div>
                </section>

                {/* Gradient Variants */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Gradient Variants</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw variant="gradient.blue" onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="gradient.blue">Blue Gradient</ButtonTw>`)}>Blue Gradient</ButtonTw>
                        <ButtonTw variant="gradient.purpleToBlue" onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="gradient.purpleToBlue">Purple to Blue</ButtonTw>`)}>Purple to Blue</ButtonTw>
                        <ButtonTw variant="gradient.greenToBlue" onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="gradient.greenToBlue">Green to Blue</ButtonTw>`)}>Green to Blue</ButtonTw>
                        <ButtonTw variant="gradient.redToYellow" onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="gradient.redToYellow">Red to Yellow</ButtonTw>`)}>Red to Yellow</ButtonTw>
                    </div>
                </section>



                {/* Bordered Gradient */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Bordered Gradient</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw variant="border.gradient-purpleToBlue" onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="border.gradient-purpleToBlue">Purple to Blue</ButtonTw>`)}>
                            Purple to Blue
                        </ButtonTw>
                        <ButtonTw variant="borderedGradient-cyanToBlue" onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="borderedGradient-cyanToBlue">Cyan to Blue</ButtonTw>`)}>
                            Cyan to Blue
                        </ButtonTw>
                        <ButtonTw variant="borderedGradient-pinkToOrange" onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="borderedGradient-pinkToOrange">Pink to Orange</ButtonTw>`)}>
                            Pink to Orange
                        </ButtonTw>
                    </div>
                </section>

                {/* Social Variants */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Social Variants</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw variant="social.facebook" icon={<FaFacebook />} onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="social.facebook" icon={<FaFacebook />}>Facebook</ButtonTw>`)}>
                            Facebook
                        </ButtonTw>
                        <ButtonTw variant="social.twitter" icon={<FiTwitter />} onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="social.twitter" icon={<FiTwitter />}>Twitter</ButtonTw>`)}>
                            Twitter
                        </ButtonTw>
                        <ButtonTw variant="social.github" icon={<FiGithub />} onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="social.github" icon={<FiGithub />}>GitHub</ButtonTw>`)}>
                            GitHub
                        </ButtonTw>
                        <ButtonTw variant="social.google" icon={<FaGoogle />} onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="social.google" icon={<FaGoogle />}>Google</ButtonTw>`)}>
                            Google
                        </ButtonTw>
                        <ButtonTw variant="social.bitcoin" icon={<FaBitcoin />} onClick={() => navigator.clipboard.writeText(`<ButtonTw variant="social.bitcoin" icon={<FaBitcoin />}>Bitcoin</ButtonTw>`)}>
                            Bitcoin
                        </ButtonTw>
                    </div>
                </section>

                {/* Sizes */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Sizes</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw size="sm" onClick={() => navigator.clipboard.writeText(`<ButtonTw size="sm">Small</ButtonTw>`)}>Small</ButtonTw>
                        <ButtonTw size="base" onClick={() => navigator.clipboard.writeText(`<ButtonTw size="base">Base</ButtonTw>`)}>Base</ButtonTw>
                        <ButtonTw size="lg" onClick={() => navigator.clipboard.writeText(`<ButtonTw size="lg">Large</ButtonTw>`)}>Large</ButtonTw>
                        <ButtonTw size="xl" onClick={() => navigator.clipboard.writeText(`<ButtonTw size="xl">Extra Large</ButtonTw>`)}>Extra Large</ButtonTw>
                    </div>
                </section>

                {/* Rounded Corners */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Rounded Corners</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw rounded="none" onClick={() => navigator.clipboard.writeText(`<ButtonTw rounded="none">None</ButtonTw>`)}>None</ButtonTw>
                        <ButtonTw rounded="sm" onClick={() => navigator.clipboard.writeText(`<ButtonTw rounded="sm">Small</ButtonTw>`)}>Small</ButtonTw>
                        <ButtonTw rounded="default" onClick={() => navigator.clipboard.writeText(`<ButtonTw rounded="default">Default</ButtonTw>`)}>Default</ButtonTw>
                        <ButtonTw rounded="lg" onClick={() => navigator.clipboard.writeText(`<ButtonTw rounded="lg">Large</ButtonTw>`)}>Large</ButtonTw>
                        <ButtonTw rounded="full" onClick={() => navigator.clipboard.writeText(`<ButtonTw rounded="full">Full</ButtonTw>`)}>Full</ButtonTw>
                    </div>
                </section>

                {/* Shadows */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Shadows</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw shadow="sm" onClick={() => navigator.clipboard.writeText(`<ButtonTw shadow="sm">Small Shadow</ButtonTw>`)}>Small Shadow</ButtonTw>
                        <ButtonTw shadow="md" onClick={() => navigator.clipboard.writeText(`<ButtonTw shadow="md">Medium Shadow</ButtonTw>`)}>Medium Shadow</ButtonTw>
                        <ButtonTw shadow="lg" onClick={() => navigator.clipboard.writeText(`<ButtonTw shadow="lg">Large Shadow</ButtonTw>`)}>Large Shadow</ButtonTw>
                        <ButtonTw shadow="xl" onClick={() => navigator.clipboard.writeText(`<ButtonTw shadow="xl">Extra Large Shadow</ButtonTw>`)}>Extra Large Shadow</ButtonTw>
                    </div>
                </section>

                {/* With Icons */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">With Icons</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw icon={<FiPlus />} onClick={() => navigator.clipboard.writeText(`<ButtonTw icon={<FiPlus />}>Add Item</ButtonTw>`)}>Add Item</ButtonTw>
                        <ButtonTw icon={<FiDownload />} variant="green" onClick={() => navigator.clipboard.writeText(`<ButtonTw icon={<FiDownload />} variant="green">Download</ButtonTw>`)}>
                            Download
                        </ButtonTw>
                        <ButtonTw icon={<FiMail />} iconPosition="right" onClick={() => navigator.clipboard.writeText(`<ButtonTw icon={<FiMail />} iconPosition="right">Send Email</ButtonTw>`)}>
                            Send Email
                        </ButtonTw>
                        <ButtonTw icon={<FiEdit />} variant="outline.blue" onClick={() => navigator.clipboard.writeText(`<ButtonTw icon={<FiEdit />} variant="outline.blue">Edit</ButtonTw>`)}>
                            Edit
                        </ButtonTw>
                    </div>
                </section>

                {/* Icon Only */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Icon Only</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw icon={<FiPlus />} iconOnly onClick={() => navigator.clipboard.writeText(`<ButtonTw icon={<FiPlus />} iconOnly />`)}/>
                        <ButtonTw icon={<FiDownload />} iconOnly variant="green" onClick={() => navigator.clipboard.writeText(`<ButtonTw icon={<FiDownload />} iconOnly variant="green" />`)}/>
                        <ButtonTw icon={<FiMail />} iconOnly variant="outline.blue" onClick={() => navigator.clipboard.writeText(`<ButtonTw icon={<FiMail />} iconOnly variant="outline.blue" />`)}/>
                        <ButtonTw icon={<FiEdit />} iconOnly variant="red" size="lg" onClick={() => navigator.clipboard.writeText(`<ButtonTw icon={<FiEdit />} iconOnly variant="red" size="lg" />`)}/>
                    </div>
                </section>

                {/* With Badges */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">With Badges</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw badge="3" onClick={() => navigator.clipboard.writeText(`<ButtonTw badge="3">Notifications</ButtonTw>`)}>Notifications</ButtonTw>
                        <ButtonTw badge="new" variant="green" onClick={() => navigator.clipboard.writeText(`<ButtonTw badge="new" variant="green">Messages</ButtonTw>`)}>
                            Messages
                        </ButtonTw>
                        <ButtonTw badge="!" variant="red" onClick={() => navigator.clipboard.writeText(`<ButtonTw badge="!" variant="red">Alerts</ButtonTw>`)}>
                            Alerts
                        </ButtonTw>
                    </div>
                </section>

                {/* States */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">States</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw disabled onClick={() => navigator.clipboard.writeText(`<ButtonTw disabled>Disabled</ButtonTw>`)}>Disabled</ButtonTw>
                        <ButtonTw loading onClick={() => navigator.clipboard.writeText(`<ButtonTw loading>Loading...</ButtonTw>`)}>Loading</ButtonTw>
                        <ButtonTw disabled loading onClick={() => navigator.clipboard.writeText(`<ButtonTw disabled loading>Disabled Loading</ButtonTw>`)}>
                            Disabled Loading
                        </ButtonTw>
                    </div>
                </section>

                {/* Block Buttons */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Block Buttons</h2>
                    <div className="space-y-4">
                        <ButtonTw block onClick={() => navigator.clipboard.writeText(`<ButtonTw block>Full Width Button</ButtonTw>`)}>Full Width Button</ButtonTw>
                        <ButtonTw block variant="green" onClick={() => navigator.clipboard.writeText(`<ButtonTw block variant="green">Full Width Success</ButtonTw>`)}>
                            Full Width Success
                        </ButtonTw>
                        <ButtonTw block variant="outline.blue" onClick={() => navigator.clipboard.writeText(`<ButtonTw block variant="outline.blue">Full Width Outline</ButtonTw>`)}>
                            Full Width Outline
                        </ButtonTw>
                    </div>
                </section>

                {/* Tooltips */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">With Tooltips</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <ButtonTw tooltip="This is a tooltip" onClick={() => navigator.clipboard.writeText(`<ButtonTw tooltip="This is a tooltip">Hover Me</ButtonTw>`)}>Hover Me</ButtonTw>
                        <ButtonTw tooltip="Delete item" variant="red" icon={<FiEdit />} onClick={() => navigator.clipboard.writeText(`<ButtonTw tooltip="Delete item" variant="red" icon={<FiEdit />}>Dangerous Action</ButtonTw>`)}>
                            Dangerous Action
                        </ButtonTw>
                        <ButtonTw
                            tooltip="Icon only button"
                            icon={<FiPlus />}
                            iconOnly
                            onClick={() => navigator.clipboard.writeText(`<ButtonTw tooltip="Icon only button" icon={<FiPlus />} iconOnly />`)}
                        />
                    </div>
                </section>
            </div>

            {/* Props Table */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Props Reference</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-theme-dark">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Prop
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Default
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Description
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    variant
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    string
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    'default'
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Button style variant. Options: default, alternative, dark, light,
                                    green, red, yellow, purple, outline.*, gradient.*, social.*
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    size
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    string
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    'base'
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Button size. Options: sm, base, lg, xl
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    rounded
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    string
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    'default'
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Border radius. Options: none, sm, default, lg, full
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    disabled
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    boolean
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    false
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Disabled state
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    loading
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    boolean
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    false
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Loading state with spinner
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    icon
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    ReactNode
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    null
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Icon component to display
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    iconPosition
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    string
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    'left'
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Icon position. Options: left, right
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    iconOnly
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    boolean
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    false
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Whether to show only the icon
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    badge
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    string
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    null
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Badge text to display
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    block
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    boolean
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    false
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Full width button
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    tooltip
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    string
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    ''
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Tooltip text
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    shadow
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    string
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    ''
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Shadow size. Options: sm, md, lg, xl
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}