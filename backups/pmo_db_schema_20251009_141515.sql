--
-- PostgreSQL database dump
--

\restrict q7Y7PKe87daA365Xf5DmSJIgKy4R7qqWsM88sR601XB4G81wa7WlY0QkTx4qiHa

-- Dumped from database version 17.6 (Homebrew)
-- Dumped by pg_dump version 17.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AllocationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AllocationStatus" AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'CANCELLED',
    'EXPIRED'
);


ALTER TYPE public."AllocationStatus" OWNER TO postgres;

--
-- Name: MilestoneStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MilestoneStatus" AS ENUM (
    'UPCOMING',
    'IN_PROGRESS',
    'COMPLETED',
    'OVERDUE'
);


ALTER TYPE public."MilestoneStatus" OWNER TO postgres;

--
-- Name: Priority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Priority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."Priority" OWNER TO postgres;

--
-- Name: ProjectStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ProjectStatus" AS ENUM (
    'PLANNING',
    'IN_PROGRESS',
    'ON_HOLD',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."ProjectStatus" OWNER TO postgres;

--
-- Name: ProjectType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ProjectType" AS ENUM (
    'ELECTRICAL',
    'IT',
    'CONSTRUCTION',
    'MAINTENANCE',
    'CONSULTING'
);


ALTER TYPE public."ProjectType" OWNER TO postgres;

--
-- Name: ResourceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ResourceStatus" AS ENUM (
    'AVAILABLE',
    'ALLOCATED',
    'BUSY',
    'ON_LEAVE'
);


ALTER TYPE public."ResourceStatus" OWNER TO postgres;

--
-- Name: ResourceType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ResourceType" AS ENUM (
    'PROJECT_MANAGER',
    'FIELD_ENGINEER',
    'IT_DEVELOPER',
    'TECHNICAL_TEAM',
    'CLIENT_STAKEHOLDER'
);


ALTER TYPE public."ResourceType" OWNER TO postgres;

--
-- Name: RiskLevel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RiskLevel" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);


ALTER TYPE public."RiskLevel" OWNER TO postgres;

--
-- Name: RiskStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RiskStatus" AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
);


ALTER TYPE public."RiskStatus" OWNER TO postgres;

--
-- Name: TaskStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TaskStatus" AS ENUM (
    'TODO',
    'IN_PROGRESS',
    'REVIEW',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."TaskStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: tbl_activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_activity_logs (
    id text NOT NULL,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text NOT NULL,
    description text,
    "userId" text NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tbl_activity_logs OWNER TO postgres;

--
-- Name: tbl_budgets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_budgets (
    id text NOT NULL,
    "projectId" text NOT NULL,
    category text NOT NULL,
    "estimatedCost" double precision NOT NULL,
    "actualCost" double precision DEFAULT 0 NOT NULL,
    "approvedBy" text,
    "approvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tbl_budgets OWNER TO postgres;

--
-- Name: tbl_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_documents (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "fileName" text NOT NULL,
    "filePath" text NOT NULL,
    "fileSize" integer NOT NULL,
    "fileType" text NOT NULL,
    "projectId" text,
    "taskId" text,
    "uploadedBy" text NOT NULL,
    "isPublic" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tbl_documents OWNER TO postgres;

--
-- Name: tbl_milestones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_milestones (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "projectId" text NOT NULL,
    status public."MilestoneStatus" DEFAULT 'UPCOMING'::public."MilestoneStatus" NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tbl_milestones OWNER TO postgres;

--
-- Name: tbl_project_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_project_members (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "userId" text NOT NULL,
    role text NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tbl_project_members OWNER TO postgres;

--
-- Name: tbl_projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_projects (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    type public."ProjectType" NOT NULL,
    client text NOT NULL,
    location text,
    status public."ProjectStatus" DEFAULT 'PLANNING'::public."ProjectStatus" NOT NULL,
    priority public."Priority" DEFAULT 'MEDIUM'::public."Priority" NOT NULL,
    progress double precision DEFAULT 0 NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tbl_projects OWNER TO postgres;

--
-- Name: tbl_resource_allocations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_resource_allocations (
    id text NOT NULL,
    "resourceId" text NOT NULL,
    "projectId" text NOT NULL,
    "allocatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "taskId" text,
    "startDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" timestamp(3) without time zone,
    status public."AllocationStatus" DEFAULT 'ACTIVE'::public."AllocationStatus" NOT NULL,
    notes text,
    "allocatedBy" text NOT NULL,
    role text,
    "allocationPercentage" integer DEFAULT 100 NOT NULL
);


ALTER TABLE public.tbl_resource_allocations OWNER TO postgres;

--
-- Name: tbl_resources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_resources (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text NOT NULL,
    "userId" text NOT NULL,
    skills text,
    department text,
    phone text,
    email text,
    "maxProjects" integer DEFAULT 3 NOT NULL,
    "hourlyRate" double precision,
    status public."ResourceStatus" DEFAULT 'AVAILABLE'::public."ResourceStatus" NOT NULL,
    type public."ResourceType" NOT NULL
);


ALTER TABLE public.tbl_resources OWNER TO postgres;

--
-- Name: tbl_risks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_risks (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "projectId" text NOT NULL,
    severity public."RiskLevel" NOT NULL,
    status public."RiskStatus" DEFAULT 'OPEN'::public."RiskStatus" NOT NULL,
    mitigation text,
    "assigneeId" text,
    "identifiedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "resolvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tbl_risks OWNER TO postgres;

--
-- Name: tbl_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_roles (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    permissions jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tbl_roles OWNER TO postgres;

--
-- Name: tbl_task_dependencies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_task_dependencies (
    id text NOT NULL,
    "taskId" text NOT NULL,
    "dependsOnTaskId" text NOT NULL
);


ALTER TABLE public.tbl_task_dependencies OWNER TO postgres;

--
-- Name: tbl_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_tasks (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "projectId" text NOT NULL,
    "assigneeId" text,
    "creatorId" text NOT NULL,
    status public."TaskStatus" DEFAULT 'TODO'::public."TaskStatus" NOT NULL,
    priority public."Priority" DEFAULT 'MEDIUM'::public."Priority" NOT NULL,
    progress double precision DEFAULT 0 NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "estimatedHours" double precision,
    "actualHours" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tbl_tasks OWNER TO postgres;

--
-- Name: tbl_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_users (
    id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    password text NOT NULL,
    phone text,
    avatar text,
    "roleId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tbl_users OWNER TO postgres;

--
-- Name: tbl_activity_logs tbl_activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_activity_logs
    ADD CONSTRAINT tbl_activity_logs_pkey PRIMARY KEY (id);


--
-- Name: tbl_budgets tbl_budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_budgets
    ADD CONSTRAINT tbl_budgets_pkey PRIMARY KEY (id);


--
-- Name: tbl_documents tbl_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_documents
    ADD CONSTRAINT tbl_documents_pkey PRIMARY KEY (id);


--
-- Name: tbl_milestones tbl_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_milestones
    ADD CONSTRAINT tbl_milestones_pkey PRIMARY KEY (id);


--
-- Name: tbl_project_members tbl_project_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_project_members
    ADD CONSTRAINT tbl_project_members_pkey PRIMARY KEY (id);


--
-- Name: tbl_projects tbl_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_projects
    ADD CONSTRAINT tbl_projects_pkey PRIMARY KEY (id);


--
-- Name: tbl_resource_allocations tbl_resource_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_resource_allocations
    ADD CONSTRAINT tbl_resource_allocations_pkey PRIMARY KEY (id);


--
-- Name: tbl_resources tbl_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_resources
    ADD CONSTRAINT tbl_resources_pkey PRIMARY KEY (id);


--
-- Name: tbl_risks tbl_risks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_risks
    ADD CONSTRAINT tbl_risks_pkey PRIMARY KEY (id);


--
-- Name: tbl_roles tbl_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles
    ADD CONSTRAINT tbl_roles_pkey PRIMARY KEY (id);


--
-- Name: tbl_task_dependencies tbl_task_dependencies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_task_dependencies
    ADD CONSTRAINT tbl_task_dependencies_pkey PRIMARY KEY (id);


--
-- Name: tbl_tasks tbl_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_tasks
    ADD CONSTRAINT tbl_tasks_pkey PRIMARY KEY (id);


--
-- Name: tbl_users tbl_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_users
    ADD CONSTRAINT tbl_users_pkey PRIMARY KEY (id);


--
-- Name: tbl_project_members_projectId_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "tbl_project_members_projectId_userId_key" ON public.tbl_project_members USING btree ("projectId", "userId");


--
-- Name: tbl_resources_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "tbl_resources_userId_key" ON public.tbl_resources USING btree ("userId");


--
-- Name: tbl_roles_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tbl_roles_name_key ON public.tbl_roles USING btree (name);


--
-- Name: tbl_task_dependencies_taskId_dependsOnTaskId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "tbl_task_dependencies_taskId_dependsOnTaskId_key" ON public.tbl_task_dependencies USING btree ("taskId", "dependsOnTaskId");


--
-- Name: tbl_users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tbl_users_email_key ON public.tbl_users USING btree (email);


--
-- Name: tbl_activity_logs tbl_activity_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_activity_logs
    ADD CONSTRAINT "tbl_activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.tbl_users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_budgets tbl_budgets_approvedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_budgets
    ADD CONSTRAINT "tbl_budgets_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES public.tbl_users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_budgets tbl_budgets_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_budgets
    ADD CONSTRAINT "tbl_budgets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.tbl_projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_documents tbl_documents_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_documents
    ADD CONSTRAINT "tbl_documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.tbl_projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_documents tbl_documents_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_documents
    ADD CONSTRAINT "tbl_documents_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public.tbl_tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_documents tbl_documents_uploadedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_documents
    ADD CONSTRAINT "tbl_documents_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES public.tbl_users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_milestones tbl_milestones_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_milestones
    ADD CONSTRAINT "tbl_milestones_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.tbl_projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_project_members tbl_project_members_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_project_members
    ADD CONSTRAINT "tbl_project_members_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.tbl_projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_project_members tbl_project_members_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_project_members
    ADD CONSTRAINT "tbl_project_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.tbl_users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_projects tbl_projects_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_projects
    ADD CONSTRAINT "tbl_projects_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.tbl_users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_resource_allocations tbl_resource_allocations_allocatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_resource_allocations
    ADD CONSTRAINT "tbl_resource_allocations_allocatedBy_fkey" FOREIGN KEY ("allocatedBy") REFERENCES public.tbl_users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_resource_allocations tbl_resource_allocations_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_resource_allocations
    ADD CONSTRAINT "tbl_resource_allocations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.tbl_projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_resource_allocations tbl_resource_allocations_resourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_resource_allocations
    ADD CONSTRAINT "tbl_resource_allocations_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES public.tbl_resources(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_resource_allocations tbl_resource_allocations_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_resource_allocations
    ADD CONSTRAINT "tbl_resource_allocations_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public.tbl_tasks(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_resources tbl_resources_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_resources
    ADD CONSTRAINT "tbl_resources_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.tbl_users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_resources tbl_resources_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_resources
    ADD CONSTRAINT "tbl_resources_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.tbl_users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_risks tbl_risks_assigneeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_risks
    ADD CONSTRAINT "tbl_risks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES public.tbl_users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_risks tbl_risks_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_risks
    ADD CONSTRAINT "tbl_risks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.tbl_projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_task_dependencies tbl_task_dependencies_dependsOnTaskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_task_dependencies
    ADD CONSTRAINT "tbl_task_dependencies_dependsOnTaskId_fkey" FOREIGN KEY ("dependsOnTaskId") REFERENCES public.tbl_tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_task_dependencies tbl_task_dependencies_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_task_dependencies
    ADD CONSTRAINT "tbl_task_dependencies_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public.tbl_tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_tasks tbl_tasks_assigneeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_tasks
    ADD CONSTRAINT "tbl_tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES public.tbl_users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_tasks tbl_tasks_creatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_tasks
    ADD CONSTRAINT "tbl_tasks_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES public.tbl_users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_tasks tbl_tasks_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_tasks
    ADD CONSTRAINT "tbl_tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.tbl_projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_users tbl_users_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_users
    ADD CONSTRAINT "tbl_users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.tbl_roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict q7Y7PKe87daA365Xf5DmSJIgKy4R7qqWsM88sR601XB4G81wa7WlY0QkTx4qiHa

