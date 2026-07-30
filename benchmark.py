import asyncio
import os
import sys
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import track

# Ensure src module is importable
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from src.pipeline import DocumentPipeline


async def run_benchmark(sample_dir: str = "sample_invoices"):
    console = Console()
    console.print(Panel.fit("[bold white]Yukti — Sarvam AI Document Pipeline Benchmark[/bold white]\n[dim]Testing 6-stage extraction, validation & confidence routing[/dim]"))

    # Ensure sample directory exists
    if not os.path.exists(sample_dir):
        os.makedirs(sample_dir, exist_ok=True)
        # Create a dummy text file as placeholder sample
        sample_file = os.path.join(sample_dir, "sample_invoice_01.jpg")
        with open(sample_file, "w") as f:
            f.write("Placeholder invoice image file for benchmarking.")
        console.print(f"[yellow]Created sample directory '[bold]{sample_dir}[/bold]' with a placeholder invoice.[/yellow]")

    invoice_files = [
        os.path.join(sample_dir, f)
        for f in os.listdir(sample_dir)
        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.pdf', '.tiff')) or f.startswith("sample_")
    ]

    if not invoice_files:
        console.print("[red]No invoice files found in sample_invoices/ directory.[/red]")
        return

    pipeline = DocumentPipeline()

    results_table = Table(title="Benchmark Execution Results", show_header=True, header_style="bold cyan")
    results_table.add_column("Invoice File", style="white")
    results_table.add_column("Supplier Name", style="bright_white")
    results_table.add_column("GSTIN", style="yellow")
    results_table.add_column("Grand Total (₹)", justify="right", style="green")
    results_table.add_column("Confidence Score", justify="right")
    results_table.add_column("Routing Decision", justify="center")
    results_table.add_column("Latency", justify="right", style="dim")

    auto_post_count = 0
    flagged_count = 0
    review_count = 0
    total_latency = 0.0

    for file_path in track(invoice_files, description="Processing invoices through Sarvam AI pipeline..."):
        file_name = os.path.basename(file_path)
        res = await pipeline.process_invoice(file_path)

        score_formatted = f"{res.composite_confidence_score:.1f}%"
        if res.composite_confidence_score >= 90.0:
            score_style = f"[bold green]{score_formatted}[/bold green]"
        elif res.composite_confidence_score >= 75.0:
            score_style = f"[bold yellow]{score_formatted}[/bold yellow]"
        else:
            score_style = f"[bold red]{score_formatted}[/bold red]"

        if res.routing_decision == "AUTO_POST":
            route_style = "[bold black on green] AUTO_POST [/bold black on green]"
            auto_post_count += 1
        elif res.routing_decision == "POST_AND_FLAG":
            route_style = "[bold black on yellow] POST_AND_FLAG [/bold black on yellow]"
            flagged_count += 1
        else:
            route_style = "[bold white on red] REVIEW_QUEUE [/bold white on red]"
            review_count += 1

        total_latency += res.processing_time_seconds

        results_table.add_row(
            file_name,
            res.extraction.supplier_name or "[dim]N/A[/dim]",
            res.extraction.supplier_gstin or "[dim]N/A[/dim]",
            f"₹{res.extraction.grand_total:,.2f}",
            score_style,
            route_style,
            f"{res.processing_time_seconds:.2f}s",
        )

    console.print("\n")
    console.print(results_table)

    total_docs = len(invoice_files)
    avg_latency = total_latency / total_docs if total_docs > 0 else 0
    auto_post_pct = (auto_post_count / total_docs * 100) if total_docs > 0 else 0

    stats_summary = (
        f"[bold]Total Documents Processed:[/bold] {total_docs}\n"
        f"[bold green]Auto-Posted (≥90%):[/bold green] {auto_post_count} ({auto_post_pct:.1f}%)\n"
        f"[bold yellow]Posted & Flagged (75-89%):[/bold yellow] {flagged_count}\n"
        f"[bold red]Sent to Review Queue (<75%):[/bold red] {review_count}\n"
        f"[bold cyan]Average Pipeline Latency:[/bold cyan] {avg_latency:.2f}s per invoice"
    )
    console.print(Panel(stats_summary, title="Benchmark Summary Statistics", border_style="green"))


if __name__ == "__main__":
    asyncio.run(run_benchmark())
