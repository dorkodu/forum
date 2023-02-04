import { Button, Card, LoadingOverlay, Textarea, TextInput } from "@mantine/core";
import { useEffect, useReducer } from "react"
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { request, sage } from "../stores/api";
import { useAppStore } from "../stores/appStore";
import { useAuthStore } from "../stores/authStore";
import { useDiscussionStore } from "../stores/discussionStore";

interface Props {
  id: string | undefined;
}

interface State {
  loading: boolean;
  status: boolean | undefined;

  title: string;
  readme: string;
}

function DiscussionEditor({ id }: Props) {
  const [state, setState] = useReducer((prev: State, next: State) => {
    const newState = { ...prev, ...next };

    if (newState.title.length > 100)
      newState.title = newState.title.substring(0, 100);

    if (newState.readme.length > 100000)
      newState.title = newState.title.substring(0, 100000);

    return newState;
  }, { title: "", readme: "", loading: false, status: undefined });

  const { t } = useTranslation();

  const requestLogin = useAppStore(state => state.requestLogin);
  const currentUserId = useAuthStore(state => state.userId);

  const navigate = useNavigate();
  const queryCreateDiscussion = useDiscussionStore(state => state.queryCreateDiscussion);
  const queryEditDiscussion = useDiscussionStore(state => state.queryEditDiscussion);

  const createDiscussion = async () => {
    if (state.loading) return;

    if (state.title.length === 0) return;
    if (state.title.length > 100) return;
    if (state.readme.length === 0) return;
    if (state.readme.length > 100000) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryCreateDiscussion(state.title, state.readme);
    setState({ ...state, loading: false, status: status });
  }

  const editDiscussion = async () => {
    if (state.loading) return;
    if (!id) return;

    if (state.title.length === 0) return;
    if (state.title.length > 100) return;
    if (state.readme.length === 0) return;
    if (state.readme.length > 100000) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryEditDiscussion(id, state.title, state.readme);
    setState({ ...state, loading: false, status: status });
  }

  const fetchDiscussion = async (id: string) => {
    const res = await sage.get(
      { a: sage.query("getDiscussion", { discussionId: id }), },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error);
    const discussion = res?.a.data;

    return { status, title: discussion?.title ?? "", readme: discussion?.readme ?? "" };
  }

  useEffect(() => {
    (async () => {
      // If user is trying to create discussion while not being logged in
      if (!currentUserId) {
        requestLogin(true);
        navigate("/home");
        return;
      }

      if (!id) return;
      setState({ ...state, loading: true, status: undefined });
      const out = await fetchDiscussion(id);
      setState({ ...state, ...out, loading: false });
    })();
  }, []);

  if (!currentUserId) return (<></>)

  return (
    <Card shadow="sm" p="lg" m="md" radius="md" withBorder>
      <LoadingOverlay visible={state.loading} overlayBlur={2} />

      <TextInput
        radius="md"
        placeholder={t("discussionTitle")}
        defaultValue={state.title}
        onChange={(ev) => { setState({ ...state, title: ev.target.value }) }}
        pb="md"
      />

      <Textarea
        radius="md"
        placeholder={t("discussionReadme")}
        defaultValue={state.readme}
        onChange={(ev) => setState({ ...state, readme: ev.target.value })}
        autosize
        pb="md"
      />

      <Button onClick={id ? editDiscussion : createDiscussion} color="dark" radius="md">
        {id ? t("editDiscussion") : t("createDiscussion")}
      </Button>
    </Card>
  )
}

export default DiscussionEditor