import { createSlice } from "@reduxjs/toolkit";
import { firebaseAuth } from "../../../firebaseConfig";
import { signInWithEmailAndPassword, getIdToken, signOut } from "firebase/auth";

const initialState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setUser, clearUser, setLoading, setError } = authSlice.actions;

export const loginUser = (email, password) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const userCredential = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );
    const token = await getIdToken(userCredential.user);

    const expirationTime = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem("sessionExpiration", expirationTime);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/signin`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    dispatch(setUser(data.user));
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    dispatch(setError("Erreur lors de la connexion"));
  } finally {
    dispatch(setLoading(false));
  }
};

export const loginWithLocalStorage = () => async (dispatch) => {
  dispatch(setLoading(true));

  const firebaseAuthKey = Object.keys(localStorage).find((key) =>
    key.startsWith("firebase:authUser")
  );

  if (!firebaseAuthKey) {
    console.warn(
      "Clé d'authentification Firebase non trouvée dans localStorage"
    );
    dispatch(setLoading(false));
    return;
  }

  const authData = JSON.parse(localStorage.getItem(firebaseAuthKey));
  const uid = authData?.uid;

  if (!uid) {
    console.warn(
      "UID introuvable dans les données d'authentification Firebase"
    );
    dispatch(setLoading(false));
    return;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/get-by-uid/${uid}`
    );

    if (!response.ok) throw new Error("Utilisateur non trouvé");

    const userData = await response.json();

    dispatch(setUser(userData.user));
  } catch (error) {
    console.error("Erreur lors du chargement de l'utilisateur :", error);
    localStorage.removeItem(firebaseAuthKey);
    dispatch(clearUser());
  } finally {
    dispatch(setLoading(false));
  }
};

export const logoutUser = () => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    await signOut(firebaseAuth);
    localStorage.removeItem("sessionExpiration");
    dispatch(clearUser());
  } catch (error) {
    console.error("Erreur lors de la déconnexion :", error);
    dispatch(setError("Erreur lors de la déconnexion"));
  } finally {
    dispatch(setLoading(false));
  }
};

export default authSlice.reducer;
