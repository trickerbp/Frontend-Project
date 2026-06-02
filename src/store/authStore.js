import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  authApi,
  classesApi,
  clearSession,
  enrollmentsApi,
  getErrorMessage,
  persistSession,
  storage,
  usersApi
} from "../api/axiosClient";

const AppContext = createContext(null);

function replaceById(items, nextItem) {
  return items.map((item) => (item.id === nextItem.id ? nextItem : item));
}

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => storage.getUser());
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [booting, setBooting] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [lastError, setLastError] = useState("");
  const currentUserRef = useRef(currentUser);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const logout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
    setClasses([]);
    setEnrollments([]);
    setStudents([]);
    setLastError("");
  }, []);

  const refreshWorkspace = useCallback(
    async (user = currentUserRef.current) => {
      if (!user) return;

      setDataLoading(true);
      setLastError("");
      try {
        const nextClasses = await classesApi.list();
        setClasses(nextClasses);

        if (user.role === "admin") {
          const [nextEnrollments, nextStudents] = await Promise.all([
            enrollmentsApi.list(),
            usersApi.students().catch(() => [])
          ]);
          setEnrollments(nextEnrollments);
          setStudents(nextStudents);
        } else {
          const mine = await enrollmentsApi.mine();
          setEnrollments(mine);
          setStudents([]);
        }
      } catch (error) {
        const message = getErrorMessage(error);
        setLastError(message);
        throw error;
      } finally {
        setDataLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const token = storage.getToken();
      if (!token) {
        setBooting(false);
        return;
      }

      try {
        const user = await authApi.me();
        if (!active) return;
        persistSession(token, user);
        setCurrentUser(user);
        await refreshWorkspace(user);
      } catch {
        if (active) logout();
      } finally {
        if (active) setBooting(false);
      }
    }

    restoreSession();
    return () => {
      active = false;
    };
  }, [logout, refreshWorkspace]);

  const login = useCallback(
    async (email, password) => {
      const response = await authApi.login({ email, password });
      persistSession(response.access_token, response.user);
      setCurrentUser(response.user);
      await refreshWorkspace(response.user);
      return response.user;
    },
    [refreshWorkspace]
  );

  const register = useCallback(
    async ({ name, email, password }) => {
      const response = await authApi.register({ name, email, password });
      persistSession(response.access_token, response.user);
      setCurrentUser(response.user);
      await refreshWorkspace(response.user);
      return response.user;
    },
    [refreshWorkspace]
  );

  const addClass = useCallback(async (payload) => {
    const created = await classesApi.create(payload);
    setClasses((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateClass = useCallback(async (id, payload) => {
    const updated = await classesApi.update(id, payload);
    setClasses((prev) => replaceById(prev, updated));
    return updated;
  }, []);

  const deleteClass = useCallback(async (id) => {
    await classesApi.remove(id);
    setClasses((prev) => prev.filter((item) => item.id !== id));
    setEnrollments((prev) => prev.filter((item) => item.class_id !== id));
  }, []);

  const enrollClass = useCallback(async (classId, note = "") => {
    const created = await enrollmentsApi.create({
      class_id: classId,
      note: note.trim() || null
    });
    setEnrollments((prev) => [created, ...prev]);
    return created;
  }, []);

  const approveEnrollment = useCallback(
    async (id) => {
      const updated = await enrollmentsApi.approve(id);
      setEnrollments((prev) => replaceById(prev, updated));
      await refreshWorkspace();
      return updated;
    },
    [refreshWorkspace]
  );

  const rejectEnrollment = useCallback(
    async (id) => {
      const updated = await enrollmentsApi.reject(id);
      setEnrollments((prev) => replaceById(prev, updated));
      await refreshWorkspace();
      return updated;
    },
    [refreshWorkspace]
  );

  const value = useMemo(
    () => ({
      currentUser,
      classes,
      enrollments,
      students,
      booting,
      dataLoading,
      lastError,
      login,
      register,
      logout,
      refreshWorkspace,
      addClass,
      updateClass,
      deleteClass,
      enrollClass,
      approveEnrollment,
      rejectEnrollment
    }),
    [
      currentUser,
      classes,
      enrollments,
      students,
      booting,
      dataLoading,
      lastError,
      login,
      register,
      logout,
      refreshWorkspace,
      addClass,
      updateClass,
      deleteClass,
      enrollClass,
      approveEnrollment,
      rejectEnrollment
    ]
  );

  return createElement(AppContext.Provider, { value }, children);
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return context;
}
