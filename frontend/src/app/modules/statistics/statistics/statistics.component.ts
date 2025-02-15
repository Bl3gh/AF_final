import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { StatisticsService } from '../../../services/statistics.service';

// Интерфейсы для типизации данных
interface MonthData {
  month: Date;
  count: number;
}

interface GenreData {
  genre: string;
  count: number;
}

interface AuthorData {
  authors: string;
  count: number;
}

@Component({
  selector: 'app-statistics',
  standalone: false,
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  @ViewChild('lineChart', { static: true }) lineChartContainer!: ElementRef;
  @ViewChild('pieChart', { static: true }) pieChartContainer!: ElementRef;
  @ViewChild('barChart', { static: true }) barChartContainer!: ElementRef;

  statsData: any;

  constructor(private statisticsService: StatisticsService) { }

  ngOnInit(): void {
    this.statisticsService.getStatistics().subscribe(data => {
      this.statsData = data;
      this.buildLineChart();
      this.buildPieChart();
      this.buildBarChart();
    });
  }

  // Линейная диаграмма: динамика добавления книг по месяцам
  buildLineChart(data?: MonthData[]): void {
    const element = this.lineChartContainer.nativeElement;
    d3.select(element).selectAll('*').remove();
  
    const rawData = this.statsData.books_by_month;
    const parseTime = d3.timeParse("%Y-%m");
  
    // Проверяем, есть ли переданные данные
    let chartData: MonthData[];
    if (data) {
      chartData = data;
    } else if (!rawData || rawData.length < 2) {
      // Если данных мало, добавляем временные данные
      chartData = [
        { month: parseTime('2025-01')!, count: 0 },
        { month: parseTime('2025-02')!, count: rawData?.[0]?.count || 0 }
      ];
    } else {
      // Преобразуем данные из rawData
      chartData = rawData.map((d: any) => ({
        month: parseTime(d.month) as Date,
        count: +d.count
      }));
    }
  
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const width = element.offsetWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
  
    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  
    const x = d3.scaleTime()
      .range([0, width])
      .domain(d3.extent(chartData, (d: MonthData) => d.month) as [Date, Date]);
  
    const y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(chartData, (d: MonthData) => d.count)!]);
  
    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5));
  
    const yAxis = svg.append("g")
      .call(d3.axisLeft(y));
  
    const lineGenerator = d3.line<MonthData>()
      .x((d: MonthData) => x(d.month))
      .y((d: MonthData) => y(d.count));
  
    const path = svg.append("path")
      .datum(chartData)
      .attr("fill", "none")
      .attr("stroke", "#3f51b5")
      .attr("stroke-width", 2)
      .attr("d", lineGenerator);
  
    const totalLength = (path.node() as SVGPathElement).getTotalLength();
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);
  
    const zoomBehavior = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [width, height]])
      .on('zoom', zoomed);
  
      d3.select<SVGSVGElement, unknown>(element).select('svg').call(zoomBehavior as any);
    function zoomed(event: any) {
      const { transform } = event;
      xAxis.call(d3.axisBottom(x).scale(transform.rescaleX(x)));
      yAxis.call(d3.axisLeft(y).scale(transform.rescaleY(y)));
      path.attr('transform', transform);
    }
  }
  
  

  // Круговая диаграмма: распределение книг по жанрам
  buildPieChart(): void {
    const element = this.pieChartContainer.nativeElement;
    d3.select(element).selectAll('*').remove();

    const data: GenreData[] = this.statsData.books_by_genre;
    if (!data || data.length === 0) { return; }

    const width = element.offsetWidth;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3.pie<GenreData>().value(d => d.count);
    const arc = d3.arc<d3.PieArcDatum<GenreData>>()
      .innerRadius(0)
      .outerRadius(radius);

    const arcs = svg.selectAll('arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

      arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => color(i.toString()))
      .each(function(d) { 
        // Расширяем SVGPathElement через приведение к any, чтобы можно было сохранить _current
        (this as any)._current = d; 
      })
      .transition()
      .duration(1500)
      .attrTween("d", function(d: d3.PieArcDatum<GenreData>) {
        // Приводим this к any для доступа к _current
        const current = (this as any)._current;
        const interpolate = d3.interpolate(current, d);
        (this as any)._current = interpolate(1);
        return function(t: number): string {
          // Обновляем путь с использованием интерполированных значений.
          // Если arc возвращает null, заменяем его на пустую строку.
          return arc(interpolate(t)) || "";
        };
      });
    
    

    arcs.append('text')
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text(d => d.data.genre);
  }

  // Столбчатая диаграмма: топ-авторы (по количеству книг)
  buildBarChart(): void {
    const element = this.barChartContainer.nativeElement;
    d3.select(element).selectAll('*').remove();

    const data: AuthorData[] = this.statsData.top_authors;
    if (!data || data.length === 0) { return; }

    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const width = element.offsetWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .range([0, width])
      .padding(0.1)
      .domain(data.map(d => d.authors));

    const y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, d => d.count)!]);

      svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.authors)!)
      .attr('width', x.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', '#ff4081')
      .transition()
      .duration(1500)
      .attr('y', d => y(d.count))
      .attr('height', d => height - y(d.count));
    

    // Ось X с поворотом подписей для лучшей читаемости
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("dx", "-0.8em")
      .attr("dy", "0.15em")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end");

    svg.append('g')
      .call(d3.axisLeft(y));
  }
}
