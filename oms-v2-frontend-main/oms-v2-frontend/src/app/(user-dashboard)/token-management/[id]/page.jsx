import React from "react";

export const metadata = {
	title: "Token Details",
	description: "Token detail view",
};

export default async function TokenDetailPage({ params }) {
	const { id } = (await params) || {};

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold">Token Details</h1>
			<p className="mt-2 text-sm text-gray-600">Token ID: {id}</p>
		</div>
	);
}
