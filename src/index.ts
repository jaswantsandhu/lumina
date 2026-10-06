// Lumina: design tokens and accessible React components.
// Import the styles once at the app root: import "@jaswantsandhu/lumina/styles.css";
export { cx } from "./utils";

// Layout & typography
export { Stack, type StackProps, type Space } from "./components/Stack";
export { Grid, type GridProps } from "./components/Grid";
export { SplitView, type SplitViewProps } from "./components/SplitView";
export { Text, Heading, Code, Kbd, Divider, type TextProps, type HeadingProps } from "./components/Text";
export { PageHeader, type PageHeaderProps } from "./components/PageHeader";

// Actions
export { Button, IconButton, type ButtonProps, type IconButtonProps, type ButtonVariant, type ButtonSize } from "./components/Button";
export { Spinner, type SpinnerProps } from "./components/Spinner";

// Forms (FileUpload and FileDownload handle files)
export { Field, useField, type FieldProps } from "./components/Field";
export { Input, Textarea, Select, type InputProps, type TextareaProps, type SelectProps } from "./components/Input";
export { Checkbox, Switch, type CheckboxProps, type SwitchProps } from "./components/Checkbox";
export { PasswordInput, NumberInput, Combobox, type PasswordInputProps, type NumberInputProps, type ComboboxProps, type ComboboxOption } from "./components/Combobox";
export { FileUpload, formatBytes, type FileUploadProps, type UploadFile } from "./components/FileUpload";
export { FileDownload, type FileDownloadProps, type DownloadSource } from "./components/FileDownload";

// Data display
export { Badge, type BadgeProps, type Tone } from "./components/Badge";
export { Card, CardHeader, CardBody, CardFooter, type CardProps, type CardHeaderProps } from "./components/Card";
export { Table, THead, TBody, TR, TH, TD } from "./components/Table";
export { Avatar, type AvatarProps } from "./components/Avatar";
export { List, ListItem, type ListItemProps } from "./components/List";
export { CodeBlock, type CodeBlockProps } from "./components/CodeBlock";
export { CodeView, type CodeViewProps } from "./components/CodeView";
export { codeLanguages, resolveLanguage } from "./components/prism/languages";
export { Prose, markdownComponents, type ProseProps, type MarkdownComponentsOptions } from "./components/Prose";
export { DataTable, type Column, type DataTableProps } from "./components/DataTable";
export { StatCard, type StatCardProps } from "./components/StatCard";
export { Progress, type ProgressProps } from "./components/Progress";
export { Timeline, type TimelineItem, type TimelineProps } from "./components/Timeline";
export { Disclosure, type DisclosureProps } from "./components/Disclosure";
export { ChatThread, ChatMessage, ChatComposer, type ChatThreadProps, type ChatMessageProps, type ChatComposerProps } from "./components/Chat";
export { EmptyState, Skeleton, type EmptyStateProps, type SkeletonProps } from "./components/EmptyState";

// Feedback & overlays
export { Alert, type AlertProps } from "./components/Alert";
export { ToastProvider, useToast, type ToastOptions } from "./components/Toast";
export { Tooltip, type TooltipProps } from "./components/Tooltip";
export { Dialog, type DialogProps } from "./components/Dialog";
export { Drawer, type DrawerProps } from "./components/Drawer";
export { ConfirmDialog, type ConfirmDialogProps } from "./components/ConfirmDialog";
export { DescriptionList, type DescriptionListProps, type DescriptionItem } from "./components/DescriptionList";
export { DropdownMenu, type DropdownMenuProps, type DropdownItem } from "./components/Dropdown";

// Navigation
export { Tabs, TabPanel, type TabItem, type TabsProps } from "./components/Tabs";
export { AppShell, SidebarBrand, SidebarFooter, NavSection, NavItem, type AppShellProps, type NavItemProps } from "./components/AppShell";

// Theme
export { useTheme, ThemeToggle, useAppearance, applyAppearance, ThemeCustomizer, ACCENTS, type ThemePreference, type Accent, type Density, type Radius, type Appearance } from "./components/Theme";

// Small charts (no Highcharts needed)
export { Sparkline, type SparklineProps } from "./components/Sparkline";
export { Gauge, type GaugeProps } from "./components/Gauge";
export { CalendarHeatmap, type CalendarHeatmapProps } from "./components/CalendarHeatmap";

// Learning & explaining: step-through diagrams, quizzes, checklists
export { StepDiagram, type StepDiagramProps, type DiagramNode, type DiagramEdge, type DiagramGroup, type DiagramStep, type DiagramValue } from "./components/StepDiagram";
export { SequenceDiagram, type SequenceDiagramProps, type SequenceParticipant, type SequenceMessage, type SequenceStep } from "./components/SequenceDiagram";
export { type DiagramCode } from "./components/diagramShared";
export { Quiz, type QuizProps, type QuizQuestion } from "./components/Quiz";
export { Checklist, type ChecklistProps, type ChecklistItem } from "./components/Checklist";
