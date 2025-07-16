import ky from 'ky';

const api = ky.create({prefixUrl: import.meta.env.VITE_API_URL,
    hooks: {
		beforeRequest: [
			async (request) => {
				const token = localStorage.getItem('resident_auth');
				if (token) {
				request.headers.set('Authorization', `Bearer ${token}`);
                }
			}
		]
	}
});

export const usersApi = api.extend((options) => ({prefixUrl: `${options.prefixUrl}/user`}));

export const anneeUniversitaireApi = api.extend((options) => ({prefixUrl: `${options.prefixUrl}/annee-universitaire`}));

export const campusApi = api.extend((options) => ({prefixUrl: `${options.prefixUrl}/campus`}));

export const pavilionsApi = api.extend((options) => ({prefixUrl: `${options.prefixUrl}/pavillon`}));

export const chambresApi = api.extend((options) => ({prefixUrl: `${options.prefixUrl}/chambre`}));

export const etudiantsApi = api.extend((options) => ({prefixUrl: `${options.prefixUrl}/etudiant`}));

export const dossiersApi = api.extend((options) => ({prefixUrl: `${options.prefixUrl}/dossier`}));

export const payementsApi = api.extend((options) => ({prefixUrl: `${options.prefixUrl}/payement`}));




