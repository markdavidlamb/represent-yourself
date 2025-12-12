#!/usr/bin/env node
/**
 * Counsel CLI
 * Command-line interface for power users
 */

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { complete, analyzeDocument, extractTimeline, checkOllamaHealth, LEGAL_PROMPTS, type LLMConfig } from "../services/llm";
import * as google from "../services/google";

const program = new Command();

// Config file location
const CONFIG_DIR = path.join(process.env.HOME || "~", ".counsel");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
const CASES_FILE = path.join(CONFIG_DIR, "cases.json");

// Ensure config directory exists
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

interface Config {
  llm: LLMConfig;
  google?: google.GoogleCredentials;
}

interface Case {
  id: string;
  name: string;
  number: string;
  court: string;
  createdAt: string;
}

// Load/save config
function loadConfig(): Config {
  if (fs.existsSync(CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
  }
  return {
    llm: {
      provider: "ollama",
      model: "mistral:latest",
      baseUrl: "http://localhost:11434",
    },
  };
}

function saveConfig(config: Config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function loadCases(): Case[] {
  if (fs.existsSync(CASES_FILE)) {
    return JSON.parse(fs.readFileSync(CASES_FILE, "utf-8"));
  }
  return [];
}

function saveCases(cases: Case[]) {
  fs.writeFileSync(CASES_FILE, JSON.stringify(cases, null, 2));
}

// Helper to prompt user
async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// ==========================================
// CLI Commands
// ==========================================

program
  .name("counsel")
  .description("AI-powered legal document assistant")
  .version("0.1.0");

// ---- Config Commands ----

program
  .command("config")
  .description("Manage configuration")
  .option("--show", "Show current config")
  .option("--llm <provider>", "Set LLM provider (ollama or claude)")
  .option("--model <model>", "Set LLM model")
  .option("--api-key <key>", "Set Claude API key")
  .action(async (options) => {
    const config = loadConfig();

    if (options.show) {
      console.log(chalk.cyan("\nCurrent Configuration:\n"));
      console.log(chalk.gray("LLM Provider:"), config.llm.provider);
      console.log(chalk.gray("LLM Model:"), config.llm.model);
      if (config.llm.provider === "ollama") {
        console.log(chalk.gray("Ollama URL:"), config.llm.baseUrl);
      }
      if (config.google?.isConnected) {
        console.log(chalk.green("\nGoogle: Connected"));
      } else {
        console.log(chalk.yellow("\nGoogle: Not connected"));
      }
      return;
    }

    if (options.llm) {
      config.llm.provider = options.llm;
      console.log(chalk.green(`Set LLM provider to ${options.llm}`));
    }

    if (options.model) {
      config.llm.model = options.model;
      console.log(chalk.green(`Set LLM model to ${options.model}`));
    }

    if (options.apiKey) {
      config.llm.apiKey = options.apiKey;
      console.log(chalk.green("Set Claude API key"));
    }

    saveConfig(config);
  });

// ---- Case Commands ----

program
  .command("case")
  .description("Manage cases")
  .option("--list", "List all cases")
  .option("--new", "Create new case")
  .option("--delete <id>", "Delete a case")
  .action(async (options) => {
    const cases = loadCases();

    if (options.list) {
      console.log(chalk.cyan("\nYour Cases:\n"));
      if (cases.length === 0) {
        console.log(chalk.gray("No cases yet. Create one with: counsel case --new"));
        return;
      }
      cases.forEach((c, i) => {
        console.log(
          chalk.white(`${i + 1}. ${c.name}`),
          chalk.gray(`(${c.number})`)
        );
        console.log(chalk.gray(`   Court: ${c.court}`));
        console.log(chalk.gray(`   Created: ${new Date(c.createdAt).toLocaleDateString()}`));
        console.log();
      });
      return;
    }

    if (options.new) {
      console.log(chalk.cyan("\nCreate New Case\n"));
      const name = await prompt(chalk.white("Case name: "));
      const number = await prompt(chalk.white("Case number: "));
      const court = await prompt(chalk.white("Court: "));

      const newCase: Case = {
        id: Math.random().toString(36).substring(2, 15),
        name,
        number,
        court,
        createdAt: new Date().toISOString(),
      };

      cases.push(newCase);
      saveCases(cases);
      console.log(chalk.green(`\nCase "${name}" created!`));
      return;
    }

    if (options.delete) {
      const idx = cases.findIndex((c) => c.id === options.delete);
      if (idx === -1) {
        console.log(chalk.red("Case not found"));
        return;
      }
      cases.splice(idx, 1);
      saveCases(cases);
      console.log(chalk.green("Case deleted"));
      return;
    }

    // Default: show list
    program.commands.find((c) => c.name() === "case")?.outputHelp();
  });

// ---- Analyze Command ----

program
  .command("analyze <file>")
  .description("Analyze a legal document")
  .option("-o, --output <file>", "Save analysis to file")
  .option("--timeline", "Extract timeline only")
  .option("--arguments", "Extract arguments only")
  .action(async (file, options) => {
    const config = loadConfig();

    // Check file exists
    if (!fs.existsSync(file)) {
      console.log(chalk.red(`File not found: ${file}`));
      process.exit(1);
    }

    // Check LLM availability
    if (config.llm.provider === "ollama") {
      const spinner = ora("Checking Ollama...").start();
      const healthy = await checkOllamaHealth(config.llm.baseUrl);
      if (!healthy) {
        spinner.fail("Ollama is not running. Start it with: ollama serve");
        process.exit(1);
      }
      spinner.succeed("Ollama connected");
    }

    // Read file
    const spinner = ora("Reading document...").start();
    let content: string;

    if (file.endsWith(".pdf")) {
      // For PDF, we'd need pdf-parse - for now just read as text
      spinner.text = "Note: PDF parsing requires additional setup";
      content = fs.readFileSync(file, "utf-8");
    } else {
      content = fs.readFileSync(file, "utf-8");
    }
    spinner.succeed(`Read ${content.length} characters`);

    // Analyze
    const analyzeSpinner = ora("Analyzing document...").start();

    try {
      let result;
      if (options.timeline) {
        result = await extractTimeline(content, config.llm);
      } else {
        result = await analyzeDocument(content, config.llm);
      }

      analyzeSpinner.succeed("Analysis complete");

      console.log(chalk.cyan("\n" + "=".repeat(60)));
      console.log(chalk.cyan("ANALYSIS RESULTS"));
      console.log(chalk.cyan("=".repeat(60) + "\n"));
      console.log(result.content);

      if (options.output) {
        fs.writeFileSync(options.output, result.content);
        console.log(chalk.green(`\nSaved to ${options.output}`));
      }
    } catch (error: any) {
      analyzeSpinner.fail(`Analysis failed: ${error.message}`);
      process.exit(1);
    }
  });

// ---- Generate Command ----

program
  .command("generate <template>")
  .description("Generate a legal document")
  .option("-f, --facts <file>", "File containing facts")
  .option("-c, --case <id>", "Case ID to use")
  .option("-o, --output <file>", "Output file")
  .action(async (template, options) => {
    const config = loadConfig();
    const cases = loadCases();

    const validTemplates = ["affirmation", "submission", "letter", "speech"];
    if (!validTemplates.includes(template)) {
      console.log(chalk.red(`Invalid template. Choose from: ${validTemplates.join(", ")}`));
      process.exit(1);
    }

    // Get case details
    let caseDetails = "";
    if (options.case) {
      const case_ = cases.find((c) => c.id === options.case);
      if (case_) {
        caseDetails = `Case: ${case_.name}\nCase Number: ${case_.number}\nCourt: ${case_.court}`;
      }
    }

    // Get facts
    let facts = "";
    if (options.facts && fs.existsSync(options.facts)) {
      facts = fs.readFileSync(options.facts, "utf-8");
    } else {
      console.log(chalk.cyan("\nEnter the facts (press Ctrl+D when done):\n"));
      facts = fs.readFileSync(0, "utf-8"); // Read from stdin
    }

    const spinner = ora(`Generating ${template}...`).start();

    try {
      const prompt = getTemplatePrompt(template);
      const result = await complete(
        [
          { role: "system", content: prompt },
          { role: "user", content: `${caseDetails}\n\nFacts:\n${facts}` },
        ],
        config.llm
      );

      spinner.succeed("Document generated");

      console.log(chalk.cyan("\n" + "=".repeat(60)));
      console.log(result.content);

      if (options.output) {
        fs.writeFileSync(options.output, result.content);
        console.log(chalk.green(`\nSaved to ${options.output}`));
      }
    } catch (error: any) {
      spinner.fail(`Generation failed: ${error.message}`);
      process.exit(1);
    }
  });

// ---- Email Commands ----

program
  .command("email")
  .description("Manage emails")
  .option("--inbox [count]", "Show recent emails")
  .option("--search <query>", "Search emails")
  .option("--from <email>", "Filter by sender")
  .action(async (options) => {
    const config = loadConfig();

    if (!config.google?.isConnected) {
      console.log(chalk.yellow("Google not connected. Run: counsel auth"));
      return;
    }

    const spinner = ora("Fetching emails...").start();

    try {
      let emails;
      if (options.search) {
        emails = await google.listEmails(config.google, options.search);
      } else if (options.from) {
        emails = await google.searchEmails(config.google, options.from);
      } else {
        const count = typeof options.inbox === "number" ? options.inbox : 10;
        emails = await google.listEmails(config.google, "", count);
      }

      spinner.succeed(`Found ${emails.length} emails`);

      console.log(chalk.cyan("\nEmails:\n"));
      emails.forEach((email) => {
        console.log(
          chalk.white(email.subject || "(No subject)"),
          chalk.gray(`- ${email.from}`)
        );
        console.log(chalk.gray(`  ${new Date(email.date).toLocaleString()}`));
        console.log(chalk.gray(`  ${email.snippet?.substring(0, 80)}...`));
        console.log();
      });
    } catch (error: any) {
      spinner.fail(`Failed: ${error.message}`);
    }
  });

// ---- Auth Command ----

program
  .command("auth")
  .description("Authenticate with Google")
  .option("--setup", "Setup Google credentials")
  .option("--status", "Check auth status")
  .action(async (options) => {
    const config = loadConfig();

    if (options.status) {
      if (config.google?.isConnected) {
        console.log(chalk.green("Google: Connected"));
      } else {
        console.log(chalk.yellow("Google: Not connected"));
        console.log(chalk.gray("Run: counsel auth --setup"));
      }
      return;
    }

    if (options.setup) {
      console.log(chalk.cyan("\nGoogle OAuth Setup\n"));
      console.log(chalk.gray("You need to create a Google Cloud project with OAuth credentials."));
      console.log(chalk.gray("See: https://console.cloud.google.com\n"));

      const clientId = await prompt(chalk.white("Client ID: "));
      const clientSecret = await prompt(chalk.white("Client Secret: "));
      const refreshToken = await prompt(chalk.white("Refresh Token: "));

      config.google = {
        clientId,
        clientSecret,
        refreshToken,
        isConnected: true,
      };

      saveConfig(config);
      console.log(chalk.green("\nGoogle credentials saved!"));
      return;
    }

    program.commands.find((c) => c.name() === "auth")?.outputHelp();
  });

// ---- Check Command ----

program
  .command("check")
  .description("Check system status")
  .action(async () => {
    console.log(chalk.cyan("\nSystem Status\n"));

    // Check Ollama
    const ollamaSpinner = ora("Checking Ollama...").start();
    const ollamaOk = await checkOllamaHealth();
    if (ollamaOk) {
      ollamaSpinner.succeed("Ollama: Running");
    } else {
      ollamaSpinner.warn("Ollama: Not running (start with: ollama serve)");
    }

    // Check config
    const config = loadConfig();
    console.log(chalk.gray(`\nLLM Provider: ${config.llm.provider}`));
    console.log(chalk.gray(`LLM Model: ${config.llm.model}`));

    if (config.google?.isConnected) {
      console.log(chalk.green("Google: Connected"));
    } else {
      console.log(chalk.yellow("Google: Not connected"));
    }

    // Check cases
    const cases = loadCases();
    console.log(chalk.gray(`\nCases: ${cases.length}`));
  });

// Helper function for template prompts
function getTemplatePrompt(template: string): string {
  switch (template) {
    case "affirmation":
      return LEGAL_PROMPTS.generateAffirmation;
    case "submission":
      return LEGAL_PROMPTS.generateSubmission;
    case "letter":
      return `You are drafting a formal letter to the court. Include:
1. Proper heading with case number
2. Formal salutation
3. Clear purpose statement
4. Body with relevant details
5. Formal closing`;
    case "speech":
      return `You are preparing oral submissions for court. Structure as:
1. Opening (introduce yourself, state what hearing is about)
2. Key arguments (numbered, clear)
3. Supporting evidence (reference exhibits)
4. Conclusion (specific relief sought)

Include timing markers for a 30-minute presentation.`;
    default:
      return "You are a legal document drafter.";
  }
}

// Run CLI
program.parse();
