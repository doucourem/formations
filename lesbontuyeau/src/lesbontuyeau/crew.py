from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent
from typing import List

@CrewBase
class Lesbontuyeau():
    """Workflow complet annonces auto"""

    agents: List[BaseAgent]
    tasks: List[Task]

    # === Agents ===
    @agent
    def analyse_vehicule(self) -> Agent:
        return Agent(
            config=self.agents_config['analyse_vehicule'],  # correspond à 'agent_1' dans agents.yaml
            verbose=True
        )

    @agent
    def redaction_annonce(self) -> Agent:
        return Agent(
            config=self.agents_config['redaction_annonce'],
            verbose=True
        )

    @agent
    def optimisation_seo(self) -> Agent:
        return Agent(
            config=self.agents_config['optimisation_seo'],
            verbose=True
        )

    @agent
    def publication_api(self) -> Agent:
        return Agent(
            config=self.agents_config['publication_api'],
            verbose=True
        )

    @agent
    def suivi_statistiques(self) -> Agent:
        return Agent(
            config=self.agents_config['suivi_statistiques'],
            verbose=True
        )

    # === Tasks ===
    @task
    def task_analyse_vehicule(self) -> Task:
        return Task(
            config=self.tasks_config['task_analyse_vehicule']  # correspond à tasks.yaml
        )

    @task
    def task_redaction_annonce(self) -> Task:
        return Task(
            config=self.tasks_config['task_redaction_annonce']
        )

    @task
    def task_optimisation_seo(self) -> Task:
        return Task(
            config=self.tasks_config['task_optimisation_seo']
        )

    @task
    def task_publication_api(self) -> Task:
        return Task(
            config=self.tasks_config['task_publication_api']
        )

    @task
    def task_suivi_statistiques(self) -> Task:
        return Task(
            config=self.tasks_config['task_suivi_statistiques'],
            output_file='rapport_statistiques.md'
        )

    # === Crew (pipeline séquentiel) ===
    @crew
    def crew(self) -> Crew:
        """Pipeline : Analyse → Rédaction → SEO → Publication → Suivi"""
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,  # exécution dans l'ordre défini
            verbose=True
        )
