import axios from 'axios';

export async function fetchJSON(path: string) {
    return axios
        .get(path)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
            throw error;
        });
}
