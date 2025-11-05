import {
  Mail, Bell, Database, GitBranch, Repeat, Shuffle, MapIcon, Edit3, Trash2, Copy,
  Filter, Calculator, Group, Combine, FunctionSquare, Code2, Type, Merge, Split,
  CalendarPlus, CalendarClock, Clock3, Star, Share2, Scissors, Globe, Webhook, Bolt
} from "lucide-react";

import { NodeTypeProps } from "../../core/types/node.types";

export const nodeTypeIcons: Record<NodeTypeProps, any> = {
  [NodeTypeProps.SEND_EMAIL]: Mail,
  [NodeTypeProps.SEND_HTTP_REQUEST]: Bell,
  [NodeTypeProps.UPDATE_DATABASE]: Database,
  [NodeTypeProps.CONDITIONAL]: GitBranch,
  [NodeTypeProps.LOOP]: Repeat,
  [NodeTypeProps.SWITCH]: Shuffle,
  [NodeTypeProps.MAP]: MapIcon,
  [NodeTypeProps.RENAME]: Edit3,
  [NodeTypeProps.REMOVE]: Trash2,
  [NodeTypeProps.COPY]: Copy,
  [NodeTypeProps.FILTER]: Filter,
  [NodeTypeProps.AGGREGATE]: Calculator,
  [NodeTypeProps.GROUP]: Group,
  [NodeTypeProps.CONCAT]: Combine,
  [NodeTypeProps.FORMULA]: FunctionSquare,
  [NodeTypeProps.CODE_BLOCK]: Code2,
  [NodeTypeProps.CONVERT_TYPE]: Type,
  [NodeTypeProps.MERGE]: Merge,
  [NodeTypeProps.SPLIT]: Split,
  [NodeTypeProps.DATE_FORMAT]: CalendarPlus,
  [NodeTypeProps.DATE_OPERATION]: CalendarClock,
  [NodeTypeProps.TIMESTAMP]: Clock3,
  [NodeTypeProps.VIP_MEMBERSHIP_INVITE]: Star,
  [NodeTypeProps.PEP_CHECK_INVITE]: Share2,
  [NodeTypeProps.RULE_EXECUTOR]: Scissors,
  [NodeTypeProps.HTTP_REQUEST]: Globe,
  [NodeTypeProps.WEBHOOK]: Webhook,
  [NodeTypeProps.EVENT]: Bolt,
  [NodeTypeProps.SCHEDULE]: CalendarClock,
};
