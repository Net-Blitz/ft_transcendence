import React, { useState, useEffect } from 'react';
import axios from 'axios';

export function useAxios(url: string) {
	const [data, setData] = useState({});
	const [isLoading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (!url) return;
		setLoading(true);
		async function fetchData() {
			try {
				const response = await axios.get(url, {
					withCredentials: true,
				});
				setData(response.data);
			} catch (err) {
				console.log(err);
				setError(true);
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, [url]);

	return { isLoading, data, error };
}
