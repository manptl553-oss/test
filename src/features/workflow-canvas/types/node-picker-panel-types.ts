export type NavigationItem =
  | {
      type: "root";
      data: WorkflowCategoryList;
    }
  | {
      type: "category" | "subcategory";
      data: WorkflowNodesCategory;
    };

export interface TemplateMeta {
  icon?: string;
  color: string;
  border: string;
  request?: Object;
  response?: Object;
}

export interface NodeTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  categoryId: string;
  metadata: TemplateMeta | null;
  visibility: boolean;
}

// Category + SubCategory structure
export interface WorkflowNodesCategory {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  order: number;
  parentId: string | null;
  icon: string | null;
  visibility: boolean;
  subCategories: WorkflowNodesCategory[];
  nodeTemplates: NodeTemplate[];
}

export type WorkflowCategoryList = WorkflowNodesCategory[];
