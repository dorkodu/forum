import { Alert, Button, Card, Flex, Text, Textarea, TextInput } from "@mantine/core";
import { useFocusWithin } from "@mantine/hooks";
import { IconAlertCircle } from "@tabler/icons-react";
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { request, sage } from "../stores/api";
import { useAppStore } from "../stores/appStore";
import { useDiscussionStore } from "../stores/discussionStore";
import { wrapContent } from "../styles/css";
import { CardPanel } from "./cards/CardPanel";
import { useWait } from "./hooks";
import CardLoader from "./loaders/CardLoader";
import OverlayLoader from "./loaders/OverlayLoader";
import InputRequirements, { getRequirement, getRequirementError } from "./popovers/InputRequirements";
import TextParser from "./TextParser";

interface Props {
  id: string | undefined;
}

interface State {
  loading: boolean;
  status: boolean | undefined;
}

function DiscussionEditor({ id }: Props) {
  const discussion = useAppStore(state => state.options.discussionEditor);
  const [state, setState] = useState<State>({ loading: !!id, status: undefined });

  const { t } = useTranslation();

  const navigate = useNavigate();
  const queryCreateDiscussion = useDiscussionStore(state => state.queryCreateDiscussion);
  const queryEditDiscussion = useDiscussionStore(state => state.queryEditDiscussion);

  const createDiscussion = async () => {
    if (state.loading) return;

    if (discussion.title.length === 0) return;
    if (discussion.title.length > 100) return;
    if (discussion.readme.length === 0) return;
    if (discussion.readme.length > 100000) return;

    setState(s => ({ ...s, loading: true, status: undefined }));
    const res = await useWait(() => queryCreateDiscussion(discussion.title, discussion.readme))();
    setState(s => ({ ...s, loading: false, status: res.status }));
    if (res.id) navigate(`/discussion/${res.id}`);
  }

  const editDiscussion = async () => {
    if (state.loading) return;
    if (!id) return;

    if (discussion.title.length === 0) return;
    if (discussion.title.length > 100) return;
    if (discussion.readme.length === 0) return;
    if (discussion.readme.length > 100000) return;

    setState(s => ({ ...s, loading: true, status: undefined }));
    const status = await useWait(() => queryEditDiscussion(id, discussion.title, discussion.readme))();
    setState(s => ({ ...s, loading: false, status: status }));
    navigate(`/discussion/${id}`);
  }

  const fetchDiscussion = async (id: string) => {
    const res = await sage.get(
      { a: sage.query("getDiscussion", { discussionId: id }), },
      (query) => useWait(() => request(query))()
    )

    const status = !(!res?.a.data || res.a.error);
    const discussion = res?.a.data;

    return { status, title: discussion?.title ?? "", readme: discussion?.readme ?? "" };
  }

  const fetchRoute = async () => {
    if (!id || discussion.id === id) return;

    setState(s => ({ ...s, loading: true, status: undefined }));
    const out = await useWait(() => fetchDiscussion(id))();
    setState(s => ({ ...s, loading: false, status: out.status }));

    useAppStore.setState(s => {
      s.options.discussionEditor.id = id;
      s.options.discussionEditor.title = out.title;
      s.options.discussionEditor.readme = out.readme;
    })
  }

  const changeMode = (value: string) => {
    if (value === "edit" || value === "preview") {
      useAppStore.setState(s => { s.options.discussionEditor.mode = value });
    }
  }

  // Necessary stuff for input validation & error messages
  const [inputReady, setInputReady] = useState({ title: false, readme: false });
  const { ref: titleRef, focused: titleFocused } = useFocusWithin();
  const { ref: readmeRef, focused: readmeFocused } = useFocusWithin();
  useEffect(() => {
    setInputReady(s => ({
      ...s,
      title: titleFocused || s.title,
      readme: readmeFocused || s.readme,
    }))
  }, [titleFocused, readmeFocused]);

  useEffect(() => { fetchRoute() }, []);

  if (id && state.loading) return <CardLoader />

  return (
    <Card shadow="sm" p="md" m="md" radius="md" withBorder>
      <Flex direction="column" gap="md">
        {state.loading && <OverlayLoader />}

        <CardPanel.Segments
          segments={[
            {
              value: discussion.mode,
              setValue: changeMode,
              label: t("mode"),
              data: [
                { label: t("editMode"), value: "edit" },
                { label: t("previewMode"), value: "preview" },
              ]
            }
          ]}
        />

        {discussion.mode === "edit" &&
          <>
            <InputRequirements
              value={discussion.title}
              requirements={getRequirement(t, "title")}
            >
              <TextInput
                radius="md"
                label={`${t("discussion.titleLabel")} (${discussion.title.length} / 100)`}
                placeholder={t("discussion.title")}
                defaultValue={discussion.title}
                onChange={(ev) => useAppStore.setState(s => { s.options.discussionEditor.title = ev.target.value })}
                error={inputReady.title && getRequirementError(t, "title", discussion.title, titleFocused)}
                ref={titleRef}
              />
            </InputRequirements>

            <InputRequirements
              value={discussion.readme}
              requirements={getRequirement(t, "readme")}
            >
              <Textarea
                radius="md"
                label={`${t("discussion.readmeLabel")} (${discussion.readme.length} / 100000)`}
                placeholder={t("discussion.readme")}
                defaultValue={discussion.readme}
                onChange={(ev) => useAppStore.setState(s => { s.options.discussionEditor.readme = ev.target.value })}
                autosize
                error={inputReady.readme && getRequirementError(t, "readme", discussion.readme, readmeFocused)}
                ref={readmeRef}
              />
            </InputRequirements>

            <Flex>
              <Button onClick={id ? editDiscussion : createDiscussion} color="dark" radius="md">
                {id ? t("discussion.edit") : t("discussion.create")}
              </Button>
            </Flex>

            {state.status === false &&
              <Alert
                icon={<IconAlertCircle size={24} />}
                title={t("error.text")}
                color="red"
                variant="light"
              >
                {t("error.default")}
              </Alert>
            }
          </>
        }

        {discussion.mode === "preview" &&
          <>
            <Flex direction="column">
              <Text weight={500} size="sm">{t("discussion.titleLabel")}</Text>
              <Card withBorder>
                <Text sx={wrapContent}>
                  <TextParser text={discussion.title} />
                </Text>
              </Card>
            </Flex>

            <Flex direction="column">
              <Text weight={500} size="sm">{t("discussion.readmeLabel")}</Text>
              <Card withBorder>
                <Text sx={wrapContent}>
                  <TextParser text={discussion.readme} />
                </Text>
              </Card>
            </Flex>
          </>
        }
      </Flex>
    </Card>
  )
}

export default DiscussionEditor