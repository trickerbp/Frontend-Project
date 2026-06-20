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
  adminApi,
  authApi,
  clearSession,
  courseResourcesApi,
  coursesApi,
  getErrorMessage,
  persistSession,
  recommendationsApi,
  storage,
  studentProfilesApi
} from "../api/axiosClient";

const AppContext = createContext(null);

function replaceById(items, nextItem) {
  return items.map((item) => (item.id === nextItem.id ? nextItem : item));
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function latestStudentProfile(value) {
  const profiles = asArray(value);
  if (profiles.length) return profiles[0];
  return value && !Array.isArray(value) ? value : null;
}

function scoreValue(item) {
  return Number(item?.score ?? item?.match_score ?? 0);
}

function recommendationItems(value) {
  let items;
  if (Array.isArray(value)) {
    items = Array.isArray(value[0]?.results) ? value[0].results : value;
  } else {
    items = asArray(value);
  }
  return [...items].sort((a, b) => scoreValue(b) - scoreValue(a));
}

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => storage.getUser());
  const [courses, setCourses] = useState([]);
  const [courseResources, setCourseResources] = useState({});
  const [studentProfile, setStudentProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [processingLogs, setProcessingLogs] = useState([]);
  const [users, setUsers] = useState([]);
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
    setCourses([]);
    setCourseResources({});
    setStudentProfile(null);
    setRecommendations([]);
    setProcessingLogs([]);
    setUsers([]);
    setLastError("");
  }, []);

  const loadCourseResources = useCallback(async (courseId) => {
    const resources = asArray(await courseResourcesApi.list(courseId));
    setCourseResources((prev) => ({ ...prev, [courseId]: resources }));
    return resources;
  }, []);

  const refreshWorkspace = useCallback(async (user = currentUserRef.current) => {
    if (!user) return;

    setDataLoading(true);
    setLastError("");
    try {
      const nextCourses = asArray(await coursesApi.list());
      setCourses(nextCourses);

      if (user.role === "student") {
        const [profile, nextRecommendations] = await Promise.all([
          studentProfilesApi.me().catch(() => null),
          recommendationsApi.mine().catch(() => [])
        ]);
        setStudentProfile(latestStudentProfile(profile));
        setRecommendations(recommendationItems(nextRecommendations));
        setProcessingLogs([]);
        setUsers([]);
      } else if (user.role === "admin") {
        const [logs, nextUsers] = await Promise.all([
          adminApi.processingLogs().catch(() => []),
          adminApi.users().catch(() => [])
        ]);
        setProcessingLogs(asArray(logs));
        setUsers(asArray(nextUsers));
        setStudentProfile(null);
        setRecommendations([]);
      } else {
        setStudentProfile(null);
        setRecommendations([]);
        setProcessingLogs([]);
        setUsers([]);
      }
    } catch (error) {
      const message = getErrorMessage(error);
      setLastError(message);
      throw error;
    } finally {
      setDataLoading(false);
    }
  }, []);

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

  const createCourse = useCallback(async (payload) => {
    const created = await coursesApi.create(payload);
    setCourses((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateCourse = useCallback(async (id, payload) => {
    const updated = await coursesApi.update(id, payload);
    setCourses((prev) => replaceById(prev, updated));
    return updated;
  }, []);

  const deleteCourse = useCallback(async (id) => {
    await coursesApi.remove(id);
    setCourses((prev) => prev.filter((item) => item.id !== id));
    setCourseResources((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const uploadCourseResource = useCallback(async (courseId, file) => {
    const created = await courseResourcesApi.upload(courseId, file);
    const refreshedCourse = await coursesApi.get(courseId).catch(() => null);
    if (refreshedCourse) setCourses((prev) => replaceById(prev, refreshedCourse));
    setCourseResources((prev) => ({
      ...prev,
      [courseId]: [created, ...(prev[courseId] || [])]
    }));
    return created;
  }, []);

  const processResource = useCallback(async (courseId, resourceId) => {
    const updated = await courseResourcesApi.process(resourceId);
    const refreshedCourse = await coursesApi.get(courseId).catch(() => null);
    if (refreshedCourse) setCourses((prev) => replaceById(prev, refreshedCourse));
    setCourseResources((prev) => ({
      ...prev,
      [courseId]: replaceById(prev[courseId] || [], updated)
    }));
    return updated;
  }, []);

  const deleteResource = useCallback(async (courseId, resourceId) => {
    await courseResourcesApi.remove(resourceId);
    setCourseResources((prev) => ({
      ...prev,
      [courseId]: (prev[courseId] || []).filter((item) => item.id !== resourceId)
    }));
  }, []);

  const saveStudentProfile = useCallback(async (payload) => {
    const saved = studentProfile?.id
      ? await studentProfilesApi.update(studentProfile.id, payload)
      : await studentProfilesApi.create(payload);
    setStudentProfile(saved);
    return saved;
  }, [studentProfile]);

  const extractCourseDraft = useCallback(async (file) => coursesApi.extract(file), []);

  const extractStudentProfileDraft = useCallback(
    async (file) => studentProfilesApi.extract(file),
    []
  );

  const generateRecommendations = useCallback(async () => {
    const generated = await recommendationsApi.generate();
    setRecommendations(recommendationItems(generated));
    return generated;
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      courses,
      courseResources,
      studentProfile,
      recommendations,
      processingLogs,
      users,
      booting,
      dataLoading,
      lastError,
      login,
      register,
      logout,
      refreshWorkspace,
      loadCourseResources,
      createCourse,
      updateCourse,
      deleteCourse,
      uploadCourseResource,
      processResource,
      deleteResource,
      saveStudentProfile,
      extractCourseDraft,
      extractStudentProfileDraft,
      generateRecommendations
    }),
    [
      currentUser,
      courses,
      courseResources,
      studentProfile,
      recommendations,
      processingLogs,
      users,
      booting,
      dataLoading,
      lastError,
      login,
      register,
      logout,
      refreshWorkspace,
      loadCourseResources,
      createCourse,
      updateCourse,
      deleteCourse,
      uploadCourseResource,
      processResource,
      deleteResource,
      saveStudentProfile,
      extractCourseDraft,
      extractStudentProfileDraft,
      generateRecommendations
    ]
  );

  return createElement(AppContext.Provider, { value }, children);
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
